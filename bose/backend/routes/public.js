import express from 'express';
import User from '../models/User.js';
import Credential from '../models/Credential.js';
import Profile from '../models/Profile.js';

const router = express.Router();

/**
 * @route   GET /api/public/profile/:userId
 * @desc    Get complete public profile for a candidate (no authentication required)
 * @access  Public
 */
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user by ID
        const user = await User.findById(userId).select('-password -walletPrivateKey');

        if (!user) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Only allow public viewing for students/candidates
        if (user.role !== 'student' && user.role !== 'candidate') {
            return res.status(403).json({ message: 'This profile is not publicly available' });
        }

        // Get complete profile data
        const profile = await Profile.findOne({ userId: userId });

        // Get verified credentials for this user
        const credentials = await Credential.find({
            userId: userId,
            status: { $in: ['verified', 'issued'] }
        }).select('title description issuer issueDate type grade course skills blockchainTxId dataHash')
            .sort({ issueDate: -1 });

        // Build comprehensive public profile response
        const publicProfile = {
            // Basic Info
            name: user.name,
            email: user.email,
            phone: profile?.phone || null,
            location: profile?.address?.city && profile?.address?.country
                ? `${profile.address.city}, ${profile.address.country}`
                : null,

            // Professional Info
            bio: profile?.bio || null,
            headline: profile?.headline || null,
            currentPosition: profile?.currentPosition || null,
            currentCompany: profile?.currentCompany || null,
            yearsOfExperience: profile?.yearsOfExperience || 0,

            // Verified Credentials (from Credential model)
            credentials: credentials.map(cred => ({
                _id: cred._id,
                title: cred.title,
                description: cred.description,
                issuer: cred.issuer,
                issueDate: cred.issueDate,
                credentialType: cred.type,
                grade: cred.grade,
                course: cred.course,
                skills: cred.skills,
                verified: cred.status === 'verified',
                blockchainHash: cred.dataHash
            })),

            // Skills (from Profile model)
            skills: profile?.skills?.map(skill => ({
                name: skill.name,
                level: skill.level === 'beginner' ? 25 :
                    skill.level === 'intermediate' ? 50 :
                        skill.level === 'advanced' ? 75 : 90,
                category: skill.level,
                yearsOfExperience: skill.yearsOfExperience,
                verified: skill.verified
            })) || [],

            // Education (from Profile model)
            education: profile?.education?.map(edu => ({
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                year: edu.endDate ? new Date(edu.endDate).getFullYear() :
                    edu.current ? 'Present' :
                        edu.startDate ? new Date(edu.startDate).getFullYear() : null,
                startDate: edu.startDate,
                endDate: edu.endDate,
                gpa: edu.grade,
                description: edu.description,
                current: edu.current
            })) || [],

            // Work Experience (from Profile model)
            experience: profile?.experience?.map(exp => ({
                company: exp.company,
                role: exp.position,
                location: exp.location,
                duration: `${new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${exp.current ? 'Present' :
                        exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                            'Present'
                    }`,
                startDate: exp.startDate,
                endDate: exp.endDate,
                current: exp.current,
                description: exp.description,
                achievements: exp.achievements || []
            })) || [],

            // Certifications (from Profile model)
            certifications: profile?.certifications?.map(cert => ({
                name: cert.name,
                issuer: cert.issuer,
                date: cert.issueDate,
                expiryDate: cert.expiryDate,
                credentialId: cert.credentialId,
                credentialUrl: cert.credentialUrl
            })) || [],

            // Projects (from Profile model)
            projects: profile?.projects?.map(proj => ({
                title: proj.title,
                description: proj.description,
                url: proj.url,
                technologies: proj.technologies,
                startDate: proj.startDate,
                endDate: proj.endDate,
                current: proj.current
            })) || [],

            // Social Links
            socialLinks: profile?.socialLinks || {},

            // Additional Info
            languages: [], // Can be added if needed
            achievements: [], // Can be extracted from credentials or added separately

            // Profile metadata
            profileCompleteness: profile?.completeness || 0,
            lastUpdated: profile?.updatedAt || user.updatedAt
        };

        res.json(publicProfile);
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

export default router;
