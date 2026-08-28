const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        // Check if an admin already exists in the database
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            // Hash the default password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            // Create the admin user
            const adminUser = new User({
                name: 'System Admin',
                email: 'admin@educonnect.com',
                password: hashedPassword,
                role: 'admin',
                accountStatus: 'Approved'
            });

            await adminUser.save();
            console.log('👑 Default Admin account created successfully!');
            console.log('   Email: admin@educonnect.com');
            console.log('   Password: admin123');
        } else {
            console.log('👑 Admin account already exists in the database.');
        }
    } catch (error) {
        console.error('❌ Error creating default admin:', error);
    }
};

module.exports = seedAdmin;
