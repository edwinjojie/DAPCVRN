import FabricCAServices from 'fabric-ca-client';
import { Wallets } from 'fabric-network';
import fs from 'fs';
import config from '../config/fabricConfig.js';

export const enrollUser = async ({ userId, role }) => {
  try {
    console.log("1️⃣ Loading CCP");
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

    console.log("6️⃣ Registering user with CA");
    const secret = await ca.register({
      affiliation: config.org.affiliation,
      enrollmentID: userId,
      role: 'client',
      attrs: [{ name: 'role', value: role, ecert: true }]
    }, adminUser);

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

    console.log(`✅ Successfully enrolled user: ${userId}`);
    return { enrolled: true };

  } catch (error) {
    console.error(`Failed to enroll user ${userId}:`, error);
    // If user is already registered but not in wallet, we might get an error.
    // Ideally we should try to re-enroll if we have the secret, but we don't store secrets.
    // For now, re-throwing.
    throw error;
  }
};

export default {
  enrollUser
};
