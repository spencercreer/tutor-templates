import { gql } from '@apollo/client'

export const ADD_STUDENT = gql`
    mutation addStudent($studentData: StudentInput!) {
        addStudent(studentData: $studentData) {
            id
            first_name
            last_name
        }
    }
`

export const UPDATE_STUDENT = gql`
    mutation updateStudent($studentData: StudentInput!) {
        updateStudent(studentData: $studentData) {
            id
            first_name
            last_name
        }
    }
`