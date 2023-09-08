interface FirebaseCollections {
    CHALLENGES_CATEGORIES_COLLECTION: string
    CHALLENGES_DATA_COLLECTION: string
    CHALLENGES_INDEX_COLLECTION: string
    USERS_NICKNAMES_COLLECTION: string
    USERS_COLLECTION: string
}
const FIREBASE_COLLECTIONS: FirebaseCollections = {
    CHALLENGES_CATEGORIES_COLLECTION: 'challengesCategories',
    CHALLENGES_DATA_COLLECTION: 'challengesData',
    CHALLENGES_INDEX_COLLECTION: 'challengesIndex',
    USERS_NICKNAMES_COLLECTION: 'unique_nicknames_in_use',
    USERS_COLLECTION: 'users',
}
export default FIREBASE_COLLECTIONS