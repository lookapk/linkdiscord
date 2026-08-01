const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("VR Discord Backend is running!");
});


app.get("/callback", async (req, res) => {

    const code = req.query.code;

    if (!code) {
        return res.status(400).send("Missing Discord code");
    }

    try {

        const token = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: process.env.REDIRECT_URI
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );


        const user = await axios.get(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization:
                    `Bearer ${token.data.access_token}`
                }
            }
        );


        console.log("Discord User:", user.data.id);


        res.send(
            "Discord linked! You can return to the VR game."
        );

    } catch(error) {

        console.log(error.response?.data || error);
        res.status(500).send("Discord login failed");

    }

});


app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});
