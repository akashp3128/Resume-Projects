import React, { useEffect, useRef, useState } from 'react'
import { Modal, Card, Form, Button } from 'react-bootstrap'
import { BiCloudUpload, BiLogOut } from 'react-icons/bi';
import { FaCloudDownloadAlt, FaSearch } from 'react-icons/fa';
import { MdOutlineAccountCircle } from 'react-icons/md';

import FileSaver from 'file-saver';

import axios from "axios";
import { useNavigate } from 'react-router-dom';

import AWS from 'aws-sdk';

const s3 = new AWS.S3(
    {
        region: process.env.REACT_APP_REGION,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY
    }
)

export default function Homepage({ENDPOINT}) {
    const user = localStorage.getItem("photoGallery422XUser");
    const searchValueRef = useRef(null)

    const [showUploadModal, setShowUploadModal] = useState(false)
    const [imageFile, setImageFile] = useState("")
    const [imageOwner, setImageOwner] = useState(user)
    const [imageList, setImageList] = useState([])
    const [refresh, setRefresh] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        if(!user){
            navigate("/ui/login")
        }
    })

    useEffect(() => {
        axios.get(`${ENDPOINT}/getAllImages`)
        .then(res => {
            if(res.status === 200){
                setImageList(res.data)
            }
        })
    },[refresh])

    async function onUpload(){
        await axios.post(`${ENDPOINT}/uploadImage`, {
            imageFile: imageFile,
            imageOwner: imageOwner,
        }, {
            headers: {
                'content-type': 'multipart/form-data' // do not forget this 
            }
        })
        .then(res => {
            if(res.status === 200){
                setShowUploadModal(false)
                setRefresh(prevState => !prevState)
            }
        })
    }

    async function onSearch(e){
        e.preventDefault()
        await axios.get(`${ENDPOINT}/getImages?searchValue=${searchValueRef?.current.value}`)
        .then(res => {
            if(res.status === 200){
                setImageList(res.data)
            }
        })
    }

    const handleFileChange = (event) => {
        const fileUploaded = event.target.files[0];
        setImageFile(fileUploaded)
    }

    async function onDownloadImage(name) {
        await axios.get(`${ENDPOINT}/downloadImage?imageName=${name}`)
        .then(res => {
            if(res.status === 200){
                const file = new Blob([new Uint8Array(res.data.Body.data)], { 
                    type: res.data.ContentType
                });
                FileSaver.saveAs(file, name)
            }
            else(
                alert("That was a fail... try again")
            )
        })

        // s3.getObject({ Bucket: process.env.REACT_APP_BUCKET, Key: name }, 
        //     (err, data) => {

        //     if (err) {
        //         alert(err.message)
        //     } else {
        //         const blob = new Blob([data.Body], { type: data.ContentType });
        //         FileSaver.saveAs(blob, name);
        //     }
        // });
    };

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center" style={{backgroundColor:"#000000", height:"10vh", color:"#FFFFFF", fontSize:"20px", letterSpacing:"2px"}} >
                Photo Gallery
                <BiLogOut className='ms-5' color="red" size={30} onClick={() => {
                    localStorage.clear()
                    setRefresh(prevState => !prevState)
                }}/>
            </div>
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Upload</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => onUpload()}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className='text-center'>
                <div className="d-flex justify-content-center my-5">
                    <Form onSubmit={(e)=> onSearch(e)} className="d-flex flex-row col-lg-6 col-md-6 col-sm-8">
                        <Form.Control size="sm" type="text" placeholder="Search..." ref={searchValueRef}/>
                        <Button type="submit" variant="dark"><FaSearch /></Button>
                    </Form>
                </div>
                <Button variant="dark" className="mb-5" onClick={() => setShowUploadModal(true)}>Upload To Gallery <BiCloudUpload size={28} /></Button>
                <div className="h-auto d-flex flex-row flex-wrap px-lg-5 px-sm-2">
                    {
                        imageList.map((item, index) => {
                            return <div key={index} className='p-3 col-lg-2 col-md-4 col-sm-12'>
                                <PhotoCard imageInfo={item} onDownloadImage={onDownloadImage} />
                            </div>
                        })
                    }
                </div>
            </div>
        </div>
    )
}

function PhotoCard({imageInfo, onDownloadImage}) {
    return (
        <Card style={{height:"100%"}}>
            <Card.Img variant="top" src={imageInfo.url} style={{aspectRatio: "1/1"}}/>
            <Card.Body className="d-flex flex-column justify-content-between" style={{backgroundColor:"grey"}}>
                <Card.Title className="text-center">{imageInfo.name}</Card.Title>
                <div className="d-flex flex-row justify-content-between">
                    <p className="mb-0"><MdOutlineAccountCircle size={26} />{imageInfo.owner}</p>
                    <FaCloudDownloadAlt size={26} onClick={() => onDownloadImage(imageInfo.name)} />
                </div>
            </Card.Body>
        </Card>
    )
}