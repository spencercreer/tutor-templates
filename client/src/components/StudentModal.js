// React
import { useState } from 'react'
// Apollo
import { useQuery, useMutation } from '@apollo/client'
import { GET_STUDENT_MODAL } from '../utils/queries'
import { UPDATE_STUDENT } from '../utils/mutations'
// Antd
import { Modal, Form, Button, message, Tooltip } from 'antd'
import { UserOutlined, EditOutlined, SlackOutlined, CopyOutlined, ClockCircleOutlined } from '@ant-design/icons'
// Components
import StudentInfo from './StudentInfo'
import EditStudentForm from './EditStudentForm'
// Utils
import { convertDate, getRandomEmoji } from '../utils/conversions'

const StudentModal = ({ visible, edit, studentId, handleCloseModal, handleToggleEdit }) => {
    const [form] = Form.useForm()
    const [updateMessage, setUpdateMessage] = useState(null)
    const [updateStudent] = useMutation(UPDATE_STUDENT)
    const { loading, data } = useQuery(GET_STUDENT_MODAL, { variables: { id: studentId } })
    if (loading)
        return <div>Loading...</div>

    const { first_name, last_name, email, class_code, grad_date, time_zone, slack } = data?.getStudent
    const gradDate = convertDate(grad_date, 'MMMM Do YYYY')
    let student = { first_name, last_name, email, class_code, gradDate, time_zone, slack }

    const handleCloseClick = () => {
        setUpdateMessage(null)
        handleCloseModal()
    }

    const handleFormNotesClick = () => {
        navigator.clipboard.writeText(email)
            .then(() => message.success(`${email} copied! ` + getRandomEmoji(), .7))
            .then(() => navigator.clipboard.writeText(`${last_name}, ${first_name}`))
            .then(() => message.success(`${last_name}, ${first_name} copied! ` + getRandomEmoji(), .7))
            .then(() => navigator.clipboard.writeText(class_code))
            .then(() => message.success(`${class_code} copied! ` + getRandomEmoji(), .7))
            .then(() => message.loading("Opening Form", 1))
            .then(() => window.open("https://docs.google.com/a/trilogyed.com/forms/d/e/1FAIpQLSc_q0CSp5Bpn7lfDAdoPCbBTW-OxWQVhC3gG5P9e6iE4FERjw/viewform", "_blank", "noreferrer"))
    }

    const handleSlackClick = () => {
        navigator.clipboard.writeText(`Please fill out the evaluation form at the link below:
https://docs.google.com/a/trilogyed.com/forms/d/e/1FAIpQLSdb4ejjbqoqKO-Q4k7zeO_xwykwB0dxYLWYm1mX5Ik45MzEeg/viewform

Your class code is: ${class_code}`)
        message.success('Slack message copied! ' + getRandomEmoji())
    };

    const handleClockOutClick = () => {
        navigator.clipboard.writeText(`${class_code}
${first_name} ${last_name}
B2B-No`)
        message.success('Clock-out notes copied! ' + getRandomEmoji())
    }

    const handleRecordSession = () => {
        //TODO: Automate this process
        navigator.clipboard.writeText(`=SPLIT("${class_code},${gradDate.formatted},${first_name} ${last_name},${email},today's date,+blank hr", ",")
        `)
    }

    const handleSubmitEdit = async (values) => {
        try {
            const { data } = await updateStudent({
                variables: { 
                    id: studentId,
                    studentData: { ...values.student }
                }
            })

            if (data.updateStudent.id) {
                student = { ...student, ...data.updateStudent}
                message.success(`The student's info was updated successfully. ` + getRandomEmoji(), 1.5)
            } else {
                setUpdateMessage({ text: 'The student was not updated.', error: true })
            }
        }
        catch (err) {
            setUpdateMessage({ text: 'The student was not updated.', error: true })
            console.error(err)
        }
    };

    const footerButtons = edit ?
        [
            <Button key="back" onClick={handleCloseClick}>
                Exit
            </Button>,
            <Tooltip key="info" title={'Student Info'}>
                <Button
                    type="primary"
                    onClick={() => handleToggleEdit(false)}
                >
                    <UserOutlined />
                </Button>
            </Tooltip>,
            <Button
                type="primary"
                htmlType="submit"
                style={{ width: "125px" }}
                loading={loading}
                onClick={() => form.submit()}
            >
                Submit
            </Button>,
        ]
        :
        [
            <Button
                key="back"
                onClick={handleCloseClick}
            >
                Exit
            </Button>,
            <Tooltip key="form-notes" title={'Form Notes'}>
                <Button
                    type="primary"
                    onClick={handleFormNotesClick}
                >
                    <CopyOutlined />
                </Button>
            </Tooltip>,
            <Tooltip key="slack-message" title={'Slack Message'}>
                <Button
                    type="primary"
                    onClick={handleSlackClick}
                >
                    <SlackOutlined />
                </Button>
            </Tooltip>,
            <Tooltip key="clock-out-notes" title={'Clock-Out Notes'}>
                <Button
                    type="primary"
                    onClick={handleClockOutClick}
                >
                    <ClockCircleOutlined />
                </Button>
            </Tooltip>,
            <Tooltip key="edit" title={'Edit'}>
                <Button
                    type="primary"
                    onClick={() => handleToggleEdit(true)}
                >
                    <EditOutlined />
                </Button>
            </Tooltip>,
            <Button
                key="record-session"
                type="primary"
                style={{ width: "125px" }}
                loading={loading}
                onClick={handleRecordSession}
            >
                Record Session
            </Button>,
        ]

    return (
        <>
            <Modal
                title={edit ? "Edit Student Info" : "Student Info"}
                visible={visible}
                onCancel={handleCloseClick}
                footer={footerButtons}
            >
                {edit ?
                    <EditStudentForm
                        student={student}
                        form={form}
                        updateMessage={updateMessage}
                        onFinish={handleSubmitEdit}
                    />
                    :
                    <StudentInfo
                        student={student}
                    />
                }
            </Modal>
        </>
    )
}

export default StudentModal