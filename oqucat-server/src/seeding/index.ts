import seedRootAdmin from './seedRootAdmin'

const seedDatabase = async () => {
  // await Promise.all([seedRootAdmin()])
  await seedRootAdmin()
}

export default seedDatabase
