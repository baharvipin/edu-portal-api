const bcrypt = require("bcrypt");
const prisma = require("../config/db");

/**
 * Service to handle school registration business logic
 */
class AuthService {
  /**
   * Register a new school with admin
   * @param {Object} registrationData - School and admin registration data
   * @returns {Promise<Object>} Created school object
   * @throws {Error} If validation fails or school email already exists
   */
  async registerSchool(registrationData) {
    const {
      schoolName,
      board,
      city,
      state,
      schoolEmail,
      adminName,
      adminEmail,
      password,
      system,
      termsAccepted
    } = registrationData;

    // Validate terms acceptance
    if (!termsAccepted) {
      throw new Error('Terms must be accepted.');
    }

    // Check if school email already exists
    const existingSchool = await prisma.school.findUnique({
      where: { email: schoolEmail }
    });

    if (existingSchool) {
      throw new Error('School email already exists.');
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create school + admin in a single transaction
    const school = await prisma.school.create({
      data: {
        name: schoolName,
        board,
        city,
        state,
        email: schoolEmail,
        system,
        profileCompleted: false,
        isActive: true,
        status: 'PROFILE_INCOMPLETE',
        admins: {
          create: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            isActive: true,
            role: 'ADMIN'
          }
        }
      },
      include: {
        admins: true
      }
    });

    return school;
  }
}

module.exports = new AuthService();
