import { ChallengeIndexDocumentInterface } from "./firebaseDocumentInterfaces"
import { WhereFilterOp } from '@firebase/firestore-types'


interface WhereQueryParametersInterface {
    key:string,
    comparisonSymbol:WhereFilterOp,
    comparisonValue: any,
}

interface FetchDocumentsFromCollectionOptionsInterface {
    limit?: number
    orderBy?: any
    descending?: boolean
    where?: WhereQueryParametersInterface
}
export {FetchDocumentsFromCollectionOptionsInterface}