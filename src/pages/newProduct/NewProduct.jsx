import React from 'react'
import { useState } from 'react'
import "./newProduct.css"
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import app from "../../firebase"
import { addAttribute, addProduct } from "../../redux/apiCalls";
import { useDispatch, useSelector } from "react-redux";
import Topbar from '../../compunents/topbar/Topbar';
import Sidebar from '../../compunents/sidebar/Sidebar';
import TextField from "@material-ui/core/TextField";
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import Modal from '../../compunents/Modal';

export default function NewProduct() {
    const token = useSelector(state => state.user.currentUser.accessToken)
    const error = useSelector(state => state.product.error)
    const [modal,setModal] = useState(false)
    const [inputs, setInputs] = useState({})
    const [displayAtt, setDisplayAtt] = useState(false)
    const [attrs, setAttrs] = useState([
        {attributeID: "", label: "", value: ""},
    ])
    const [file, setFile] = useState(null)
    const [cat, setCat] = useState([])
    const dispatch = useDispatch();
    const handleChange = (e) => {
        setInputs(prev => {
            return { ...prev, [e.target.name]: e.target.value };
        })
    }
    const handleCat = (e) => {
        setCat(e.target.value.split(","))
    }
    const handleChangeInput = (index, e) => {
        const values = [...attrs]
        values[index][e.target.name] = e.target.value
        setAttrs(values)
    }
    const handleAddField = () => {
        setAttrs([...attrs, {attributeID: "", label: "", value: ""}])
    }
    const handleRemoveFields = (index) => {
        const values = [...attrs]
        values.splice(index,1)
        setAttrs(values)
    }
    const handleClick = (e) => {
        e.preventDefault()
        const fileName = new Date().getTime() + file.name
        const storage = getStorage(app)
        const storageRef = ref(storage, fileName)
        const uploadTask = uploadBytesResumable(storageRef, file);
             // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
                switch (snapshot.state) {
                    case "paused":
                    console.log("Upload is paused");
                    break;
                    case "running":
                    console.log("Upload is running");
                    break;
                    default:
                }
            },
            (error) => {
            // Handle unsuccessful uploads
            },
            () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                const product = { ...inputs, img: downloadURL, categories: cat };
                addProduct(product, dispatch, token, attrs);
                setModal(true)
                setAttrs([{attributeID: "", label: "", value: ""}])
            });
            }
            );
        
    }
    
    return (
        <div className="wrapper">
            <Topbar/>
            <div className="container">
                {modal && <Modal stateModal={setModal} message={error ? "C?? l???i x???y ra, vui l??ng th??? l???i" : "Th??m s???n ph???m m???i th??nh c??ng!"}/>}
                <Sidebar/>
                <div className="newProduct">
                        <h1 className="addProductTitle">S???n ph???m m???i</h1>
                        <form className="addProductForm" onSubmit={handleClick}>
                            <div className="addProductItem">
                                <label>???nh s???n ph???m</label>
                                <input type="file" id="file" required onChange={e => setFile(e.target.files[0])}/>
                            </div>
                            <div className="addProductItem">
                                <label>T??n</label>
                                <input name='title' type="text" required placeholder="Apple Airpods" onChange={handleChange} />
                            </div>
                            <div className="addProductItem">
                                <label>Gi??(????n v???: Ngh??n ?????ng)</label>
                                <input name='price' type="number" required placeholder="????n v???: ngh??n ?????ng" onChange={handleChange}/>
                            </div>
                            <div className="addProductItem">
                                <label>M?? t???</label>
                                <input name='desc' type="text" placeholder="M?? t???" onChange={handleChange}/>
                            </div>
                            <div className="addProductItem">
                                <label>Category</label>
                                <input name='category' type="text" required placeholder="Category" onChange={handleCat}/>
                            </div>
                            <div>
                                <button className='addAttributeButton' onClick={() => setDisplayAtt(!displayAtt)} style={displayAtt ? {backgroundColor:"d32f2f"} : {}}>{!displayAtt ? "Th??m thu???c t??nh" : "X??a"}</button>
                               {displayAtt && attrs.map((attr,index) => (
                                   <div key={index} className="productAttribute">
                                       <TextField
                                        style={{marginRight:"10px",marginBottom:"10px"}}
                                        name='attributeID'
                                        label="Thu???c t??nh"
                                        variant='outlined'
                                        value={attr.attributeID}
                                        onChange={e => handleChangeInput(index, e)}
                                       />
                                       <TextField
                                        style={{marginRight:"10px"}}
                                        name='label'
                                        label="M?? t??? "
                                        variant='outlined'
                                        value={attr.label}
                                        onChange={e => handleChangeInput(index, e)}
                                       />
                                       <TextField
                                        style={{marginRight:"10px"}}
                                        name='value'
                                        label="Gi?? tr???"
                                        variant='outlined'
                                        value={attr.value}
                                        onChange={e => handleChangeInput(index, e)}
                                       />
                                       <IconButton onClick={() => handleAddField()}  disabled={Object.values(attr).some(item => item.trim() === "")}>
                                           <AddIcon/>
                                       </IconButton>
                                       <IconButton disabled={attrs.length === 1} onClick={() => handleRemoveFields(index)}>
                                           <RemoveIcon/>
                                       </IconButton>
                                   </div>
                               ))}
                            </div>
                            <button type='submit' className="addProductButton">Create</button>
                        </form>
                    </div>
                </div>
            </div>
    )
}
