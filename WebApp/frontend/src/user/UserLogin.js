import React, { useState } from 'react';
import Axios from 'axios';

function UserLogin() {
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [username, setUserName] = useState("");
    const [password, setPassWord] = useState("");

    const Submit = () => {
        Axios.post("")
    }
    return (
        <div className='UserLogin'>

            <h1>
                User Create
            </h1>

            <div className='createForm'>
                <label>First Name:</label>
                <input type="text"
                    name="firstname"
                    onChange={(e) => {
                        setFirstName(e.target.value)
                    }} />

                <input type="text"
                    name="lastname"
                    onChange={(e) => {
                        setLastName(e.target.value)
                    }} />

                <input type="text"
                    name="username"
                    onChange={(e) => {
                        setUserName(e.target.value)
                    }} />

                <input type="text"
                    name="password"
                    onChange={(e) => {
                        setPassWord(e.target.value)
                    }} />

                <button onClick={ } >Submit</button>
            </div>
        </div>
    )
}

export default UserLogin;