var express = require("express");
const pharmacistHelpers = require("../helpers/pharmacist-helpers");
var router = express.Router();
var jwt = require("jsonwebtoken");
const Fuse = require("fuse.js");
const { exportExcel } = require("../helpers/export-xlsx");
require("dotenv").config();

const verifyLogin = (req, res, next) => {
    if (req.cookies.pharmacistToken) {
        jwt.verify(
            req.cookies.pharmacistToken,
            process.env.JWT_SECERT,
            (error, decoded) => {
                if (error) {
                    return res.redirect("/login");
                } else {
                    req.pharmacist = decoded;
                    pharmacistHelpers
                        .checkUserStatus(decoded._id)
                        .then((resposne) => {
                            if (decoded.slotConfig) {
                                next();
                            } else if (req.url === "/config/slot") {
                                next();
                            } else {
                                res.redirect("/config/slot");
                            }
                        })
                        .catch((error) => {
                            res.clearCookie("pharmacistToken");
                            res.redirect("/login");
                        });
                }
            }
        );
    } else {
        res.redirect("/login");
    }
};

const loginCheck = (req, res, next) => {
    if (req.cookies.pharmacistToken) {
        jwt.verify(
            req.cookies.pharmacistToken,
            process.env.JWT_SECERT,
            (error, decoded) => {
                if (error) {
                    next();
                } else {
                    req.pharmacist = decoded;
                    res.redirect("/");
                }
            }
        );
    } else {
        next();
    }
};

const verifyToken = (req, res, next) => {
    const rawCookies = req.headers.cookie.split("; ");

    const parsedCookies = {};
    rawCookies.forEach((rawCookie) => {
        const parsedCookie = rawCookie.split("=");
        parsedCookies[parsedCookie[0]] = parsedCookie[1];
    });
    if (parsedCookies.pharmacistToken) {
        jwt.verify(
            parsedCookies.pharmacistToken,
            process.env.JWT_SECERT,
            (error, decoded) => {
                if (error) {
                    res.json("login");
                } else {
                    req.pharmacist = decoded;
                    pharmacistHelpers
                        .checkUserStatus(decoded._id)
                        .then((resposne) => {
                            next();
                        })
                        .catch((error) => {
                            res.clearCookie("pharmacistToken");
                            res.redirect("/login");
                        });
                }
            }
        );
    } else {
        res.json("login");
    }
};
/* Medicines */
router.get("/", verifyLogin, (req, res) => {
    pharmacistHelpers.getMedicines(req.pharmacist._id).then((response) => {
        res.render("pharmacist/index", {
            title: "My Store",
            pharmacistLogged: req.pharmacist,
            medicines: response,
        });
    });
});

router.get("/medicine/:id", verifyLogin, async(req, res) => {
    pharmacistHelpers.getOneMedicine(req.params.id).then((response) => {
        res.render("pharmacist/medicine-id", {
            title: "Edit Medicine",
            pharmacistLogged: req.pharmacist,
            medicine: response,
        });
    });
});

router.post("/medicine/:id", verifyLogin, (req, res) => {
    pharmacistHelpers.updateMedicine(req.params.id, req.body).then((response) => {
        res.redirect("/medicines");
    });
});

router.get("/add-medicine", verifyLogin, (req, res) => {
    res.render("pharmacist/add-medicine", {
        title: "Add Medicine",
        pharmacistLogged: req.pharmacist,
        error: req.session.adderror,
        medicine: req.session.medicine,
    });
    req.session.adderror = null;
    req.session.medicine = null;
});

router.post("/add-medicine", verifyLogin, (req, res) => {
    pharmacistHelpers
        .addMedicine(req.body)
        .then((response) => {
            console.log("Thêm thuốc thành công");
            res.redirect("/");
        })
        .catch((error) => {
            req.session.adderror = error.msg;
            req.session.medicine = req.body;
            res.redirect("/");
        });
});

router.delete("/medicine/:id", verifyLogin, (req, res) => {
    pharmacistHelpers
        .deleteMedicine(req.params.id)
        .then((response) => {
            res.json({ status: true });
        })
        .catch((error) => {
            res.json(error);
        });
});
router.get("/login", loginCheck, (req, res) => {
    res.render("pharmacist/login", {
        title: "Pharmacist Login",
        error: req.session.loginErr,
        entered: req.session.loginUser,
    });
});

router.post("/login", (req, res) => {
    pharmacistHelpers
        .dologin(req.body)
        .then((data) => {
            delete data.password;
            var token = jwt.sign(data, process.env.JWT_SECERT, {
                expiresIn: "60d",
            });
            res.cookie("pharmacistToken", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 5184000000),
                secure: process.env.NODE_ENV === "production" ? true : false,
            });
            res.redirect("/");
        })
        .catch((error) => {
            req.session.loginErr = error.msg;
            req.session.loginUser = req.body;
            res.redirect("/login");
        });
});

router.get("/logout", (req, res) => {
    res.clearCookie("pharmacistToken");
    res.redirect("/login");
});

router.get("/myprofile", verifyLogin, (req, res) => {
    pharmacistHelpers.getMyProfile(req.pharmacist._id).then((response) => {
        res.render("pharmacist/profile", {
            title: "My Profile",
            pharmacistLogged: req.pharmacist,
            pharmacistDetails: response,
        });
    });
});

router.get("/profile/edit", verifyLogin, (req, res) => {
    pharmacistHelpers.getMyProfile(req.pharmacist._id).then((response) => {
        res.render("pharmacist/edit-profile", {
            title: "Edit Profile",
            pharmacistLogged: req.pharmacist,
            pharmacist: response,
        });
    });
});

router.get("/username/:name", verifyToken, (req, res) => {
    pharmacistHelpers
        .checkUsername(req.params.name, req.pharmacist.username)
        .then((response) => {
            res.json(response);
        });
});

router.post("/profile/details/:id", verifyLogin, (req, res) => {
    pharmacistHelpers
        .editProfileDeatils(req.pharmacist._id, req.body)
        .then((response) => {
            res.redirect("/myprofile");
        });
});

router.get("/profile/username", verifyLogin, (req, res) => {
    pharmacistHelpers.getMyProfile(req.pharmacist._id).then((response) => {
        res.render("pharmacist/edit-username", {
            title: "Edit Username",
            pharmacistLogged: req.pharmacist,
            pharmacist: response,
        });
    });
});

router.post("/profile/username/:id", verifyLogin, (req, res) => {
    pharmacistHelpers.editUsername(req.pharmacist._id, req.body.name).then((response) => {
        res.clearCookie("pharmacistToken");
        res.render("pharmacist/message", {
            title: "Username Changed",
            message: "You have to relogin to complete the verification",
            redirect: "/login",
        });
    });
});

router.get("/profile/slot-config", verifyLogin, (req, res) => {
    pharmacistHelpers.getMySlotConfig(req.pharmacist._id).then((response) => {
        console.log(response);
        res.render("pharmacist/slot-config", {
            title: "Edit Slot Config",
            pharmacistLogged: req.pharmacist,
            slotConfig: response.slotConfig,
        });
    });
});

router.post("/profile/slot-config/", verifyLogin, (req, res) => {
    var slotConfig = {
        configSlotHours: req.body.slotHours,
        configSlotMinutes: req.body.slotMinutes,
        configSlotPreparation: req.body.slotPreparation,
        timeArr: [{ startTime: req.body.startTime, endTime: req.body.endTime }],
    };
    pharmacistHelpers
        .upadateSlotConfig(req.pharmacist._id, slotConfig)
        .then((response) => {
            res.redirect("/myprofile");
        });
});

router.get("/profile/change-password", verifyLogin, async(req, res) => {
    let profileDetails = await pharmacistHelpers.getMyProfile(req.pharmacist._id);
    var payload = {
        id: req.pharmacist._id,
    };
    var token = jwt.sign(payload, process.env.JWT_RESET_PASSWORD, {
        expiresIn: "5m",
    });
    var template = `
  <h2>Change Password</h2>
  <a href="${process.env.pharmacist_HOSTNAME}/profile/change-password/${token}">${process.env.pharmacist_HOSTNAME}/profile/change-password/${token}</a>
  `;
    sendMail(profileDetails.email, "Change Password", template);
    res.render("pharmacist/password-meassage", {
        title: "Change Password",
        message: `Change password link sent to your mail ${profileDetails.email}`,
    });
});

router.get("/profile/change-password/:token", (req, res) => {
    jwt.verify(
        req.params.token,
        process.env.JWT_RESET_PASSWORD,
        (err, decoded) => {
            if (err) {
                res.render("pharmacist/password-meassage", {
                    title: "Link Exipred",
                    message: `The link was exipred the link is only valid for 5 Minutes`,
                });
            } else {
                res.render("pharmacist/change-password", {
                    title: "New Password",
                    id: decoded.id,
                });
            }
        }
    );
});

router.post("/profile/change-password", (req, res) => {
    pharmacistHelpers.changePassword(req.body).then((response) => {
        res.clearCookie("pharmacistToken");
        res.redirect("/");
    });
});

router.get("/forget/password", (req, res) => {
    res.render("pharmacist/forget-password", {
        title: "Forget Password",
        error: req.session.resetErr,
    });
    req.session.resetErr = null;
});

router.post("/reset/password/send", (req, res) => {
    pharmacistHelpers
        .getMyProfileEmail(req.body.email)
        .then((response) => {
            var payload = {
                id: response._id,
            };
            var token = jwt.sign(payload, process.env.JWT_RESET_PASSWORD, {
                expiresIn: "5m",
            });
            var template = `
  <h2>Reset Password</h2>
  <a href="${process.env.pharmacist_HOSTNAME}/reset/password/${token}">${process.env.pharmacist_HOSTNAME}/reset/password/${token}</a>
  `;
            sendMail(response.email, "Reset Password", template);
            res.render("pharmacist/password-meassage", {
                title: "Reset Password",
                message: `Reset password link sent to your mail ${response.email}`,
            });
        })
        .catch((error) => {
            req.session.resetErr = error.msg;
            res.redirect("/forget/password");
        });
});

router.get("/reset/password/:token", (req, res) => {
    jwt.verify(
        req.params.token,
        process.env.JWT_RESET_PASSWORD,
        (err, decoded) => {
            if (err) {
                res.render("pharmacist/password-meassage", {
                    title: "Link Exipred",
                    message: `The link was exipred the link is only valid for 5 Minutes`,
                });
            } else {
                res.render("pharmacist/change-password", {
                    title: "New Password",
                    id: decoded.id,
                });
            }
        }
    );
});

router.post("/reset/password", (req, res) => {
    pharmacistHelpers.changePassword(req.body).then((response) => {
        res.redirect("/login");
    });
});

router.get("/config/slot", verifyLogin, (req, res) => {
    res.render("pharmacist/create-slot-config", {
        title: "Create Slot Config",
        pharmacistLogged: req.pharmacist,
    });
});

router.post("/config/slot", verifyLogin, (req, res) => {
    var slotConfig = {
        configSlotHours: req.body.slotHours,
        configSlotMinutes: req.body.slotMinutes,
        configSlotPreparation: req.body.slotPreparation,
        timeArr: [{ startTime: req.body.startTime, endTime: req.body.endTime }],
    };
    pharmacistHelpers
        .upadateSlotConfig(req.pharmacist._id, slotConfig)
        .then((response) => {
            pharmacistHelpers
                .getMyProfile(req.pharmacist._id)
                .then((data) => {
                    delete data.password;
                    var token = jwt.sign(data, process.env.JWT_SECERT, {
                        expiresIn: "60d",
                    });
                    res.cookie("pharmacistToken", token, {
                        httpOnly: true,
                        expires: new Date(Date.now() + 5184000000),
                        secure: process.env.NODE_ENV === "production" ? true : false,
                    });
                    res.redirect("/");
                })
                .catch((error) => {
                    req.session.loginErr = error.msg;
                    req.session.loginUser = req.body;
                    res.redirect("/login");
                });
        });
});

module.exports = router;