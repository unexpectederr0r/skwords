import axios from 'axios'
import API_KEYS from '../../../SECRET_API_KEYS'
const PERSPECTIVE_API_KEY = API_KEYS.PERSPECTIVE_API_KEY
const PERSPECTIVE_API_ENDPOINT = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=' + PERSPECTIVE_API_KEY

export function analyzeComment(comment) {
  const requestBody = {
    comment: { text: comment },
    languages: ['en'],
    // Reference: https://developers.perspectiveapi.com/s/about-the-api-attributes-and-languages?language=en_US
    requestedAttributes: {
      TOXICITY: {},
      PROFANITY: {},
      SEXUALLY_EXPLICIT:{},
    },
  }

  const requestConfig = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  return axios.post(PERSPECTIVE_API_ENDPOINT, requestBody, requestConfig)
    .then(response => {
      const attributeScores = response.data.attributeScores
      const toxicityScore = attributeScores.TOXICITY.summaryScore.value
      const profanityScore = attributeScores.PROFANITY.summaryScore.value
      const sexuallyExplicitScore = attributeScores.SEXUALLY_EXPLICIT.summaryScore.value
      return {
        toxicityScore,
        profanityScore,
        sexuallyExplicitScore
      }
    })
    .catch(error => {
      console.error('Error analyzing comment:', error)
      throw error
    })
}