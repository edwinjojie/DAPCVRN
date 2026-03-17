import FabricCAServices from 'fabric-ca-client';
import { Wallets } from 'fabric-network';
import fs from 'fs';
import config from '../config/fabricConfig.js';

export const enrollUser = async ({ userId, role }) => {
  try {
    console.log(`1️⃣ Loading CCP (enrolling ${userId} with role: ${role})`);
    if (!fs.existsSync(config.ccpPath)) {
      throw new Error(`CCP not found at ${config.ccpPath}`);
    }
    const ccp = JSON.parse(fs.readFileSync(config.ccpPath, 'utf8'));
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
      caInfo.caName
    );

    console.log("3️⃣ Opening wallet");
    const wallet = await Wallets.newFileSystemWallet(config.walletPath);

    console.log("4️⃣ Checking existing user");
    const userExists = await wallet.get(userId);
    if (userExists) {
      console.log(`⚠️ User ${userId} already exists in wallet`);
      return { exists: true };
    }

    console.log("5️⃣ Fetching admin identity");
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      console.error('Admin identity not found in wallet. Run enrollAdmin.js first.');
      throw new Error('Admin not enrolled');
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // Try to register the user. If already registered, remove and re-register
    // so the correct role attribute is applied.
    let secret;
    console.log(`6️⃣ Registering user with CA (role attr: ${role})`);
    try {
      secret = await ca.register({
        affiliation: config.org.affiliation,
        enrollmentID: userId,
        role: 'client',
        attrs: [{ name: 'role', value: role, ecert: true }]
      }, adminUser);
    } catch (regError) {
      const isAlreadyRegistered =
        regError.message?.includes('is already registered') ||
        regError.errors?.some(e => e.code === 74);

      if (isAlreadyRegistered) {
        console.log(`⚠️ Identity ${userId} already registered on CA. Updating attrs and re-enrolling with role: ${role}...`);
        // Identity removal may be disabled on the CA, so instead we UPDATE
        // the existing identity's attributes and reset maxEnrollments to
        // allow a fresh enrollment.
        const idService = ca.newIdentityService();
        try {
          await idService.update(userId, {
            affiliation: config.org.affiliation,
            attrs: [{ name: 'role', value: role, ecert: true }],
            maxEnrollments: -1,  // allow unlimited enrollments
            enrollmentSecret: userId  // reset the secret so we know it
          }, adminUser);
          console.log(`✅ Updated identity ${userId} attrs on CA (role: ${role})`);
          secret = userId;  // use the reset secret
        } catch (updateError) {
          console.warn(`⚠️ Could not update identity: ${updateError.message}`);
          // Last resort: try registering with a slightly different name
          const altUserId = userId + '_v2';
          console.log(`🔄 Trying alternative identity: ${altUserId}`);
          secret = await ca.register({
            affiliation: config.org.affiliation,
            enrollmentID: altUserId,
            role: 'client',
            attrs: [{ name: 'role', value: role, ecert: true }]
          }, adminUser);
          // Override userId for enrollment below (we'll save under original name though)
          // Actually we need to enroll the alt name, so let's just update userId
          // This is handled by returning and re-calling with alt name
          throw new Error(`Re-register under alt identity ${altUserId} – please retry`);
        }
      } else {
        throw regError;
      }
    }

    console.log("7️⃣ Enrolling user");
    const enrollment = await ca.enroll({
      enrollmentID: userId,
      enrollmentSecret: secret,
      attr_reqs: [{ name: 'role', optional: false }]
    });

    console.log("8️⃣ Writing to wallet");
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      mspId: config.org.mspId,
      type: 'X.509'
    };
    await wallet.put(userId, x509Identity);

    console.log(`✅ Successfully enrolled user: ${userId} with role: ${role}`);
    return { enrolled: true };

  } catch (error) {
    console.error(`Failed to enroll user ${userId}:`, error);
    throw error;
  }
};

export default {
  enrollUser
};
