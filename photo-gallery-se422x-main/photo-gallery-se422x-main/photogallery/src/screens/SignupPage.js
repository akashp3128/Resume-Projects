import React, { useRef } from 'react'
import axios from "axios";
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


export default function SignupPage({ENDPOINT}) {
    const navigate = useNavigate()
    const usernameRef = useRef(null)
    const passwordRef = useRef(null)
    const confirmPasswordRef = useRef(null)

    async function onSignup(e){
        e.preventDefault()

        if(passwordRef?.current.value === confirmPasswordRef?.current.value){
            await axios.post(`${ENDPOINT}/signup`, {
                username: usernameRef?.current.value,
                password: passwordRef?.current.value,
            })
            .then(res => {
                if(res.data.status === 200){
                    localStorage.setItem('photoGallery422XUser', usernameRef?.current.value)
                    navigate("/ui/home")
                }
                else{
                    alert(res.data.message)
                }
            })
        }
        else{
            alert("passwords do not match")
        }
    }

    return (
        <div className="vw-100 vh-100 d-flex flex-column justify-content-center align-items-center">
            <p style={{fontSize:"50px", fontWeight:"bolder", letterSpacing:"5px"}}>PHOTO GALLERY</p>
            <Form onSubmit={(e)=> onSignup(e)}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Enter username" ref={usernameRef} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" ref={passwordRef} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" ref={confirmPasswordRef} />
                </Form.Group>
                <div className="d-flex justify-content-center">
                    <Button variant="primary" type="submit">
                        Signup
                    </Button>
                </div>
                <p className='text-center mt-3 text-decoration-underline user-select-none' onClick={() => navigate("/ui/login")}>Login</p>
            </Form>
        </div>
    )
}
