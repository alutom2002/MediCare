var express = require("express");
const receptionistHelpers = require("../helpers/receptionist-helpers");
var router = express.Router();
var jwt = require("jsonwebtoken");
const Fuse = require("fuse.js");
const { exportExcel } = require("../helpers/export-xlsx");
const { sendMail } = require("../helpers/send-mail");
const { response } = require("express");
require("dotenv").config();

const verifyLogin = (req, res, next) => {
    if (req.cookies.receptionistToken) {
        jwt.verify(
            req.cookies.receptionistToken,
            process.env.JWT_SECERT,
            (error, decoded) => {
                if (error) {
                    return res.redirect("/login");
                } else {
                    req.receptionist = decoded;
                    receptionistHelpers
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
                            res.clearCookie("receptionistToken");
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
    if (req.cookies.receptionistToken) {
        jwt.verify(
            req.cookies.receptionistToken,
            process.env.JWT_SECERT,
            (error, decoded) => {
                if (error) {
                    next();
                } else {
                    req.receptionist = decoded;
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
    if (parsedCookies.receptionistToken) {
        jwt.verify(
            parsedCookies.receptionistToken,
            process.env.JWT_SECERT,
            (error, decoded) => {
                if (error) {
                    res.json("login");
                } else {
                    req.receptionist = decoded;
                    receptionistHelpers
                        .checkUserStatus(decoded._id)
                        .then((resposne) => {
                            next();
                        })
                        .catch((error) => {
                            res.clearCookie("receptionistToken");
                            res.redirect("/login");
                        });
                }
            }
        );
    } else {
        res.json("login");
    }
};

router.get("/", verifyLogin, (req, res) => {
    receptionistHelpers.getMyCustomers(req.receptionist._id).then((response) => {
        res.render("receptionist/index", {
            title: "Customers",
            receptionistLogged: req.receptionist,
            customers: response,
        });
    });
});

router.get("/receipt/:id", verifyLogin, async(req, res) => {
    let receipts = await receptionistHelpers.getReceiptsHistory(req.params.id);
    res.render("admin/receipt-id", {
        title: "Receipt",
        receptionistLogged: req.receptionist,
        searchId: req.params.id,
        search: true,
        receipts,

    });
});

router.get("/login", loginCheck, (req, res) => {
    res.render("receptionist/login", {
        title: "receptionist Login",
        error: req.session.loginErr,
        entered: req.session.loginUser,
    });
});

router.post("/login", (req, res) => {
    receptionistHelpers
        .dologin(req.body)
        .then((data) => {
            delete data.password;
            var token = jwt.sign(data, process.env.JWT_SECERT, {
                expiresIn: "60d",
            });
            res.cookie("receptionistToken", token, {
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
    res.clearCookie("receptionistToken");
    res.redirect("/login");
});

router.get("/myprofile", verifyLogin, (req, res) => {
    receptionistHelpers.getMyProfile(req.receptionist._id).then((response) => {
        res.render("receptionist/profile", {
            title: "My Profile",
            receptionistLogged: req.receptionist,
            receptionistDetails: response,
        });
    });
});

router.get("/profile/edit", verifyLogin, (req, res) => {
    receptionistHelpers.getMyProfile(req.receptionist._id).then((response) => {
        res.render("receptionist/edit-profile", {
            title: "Edit Profile",
            receptionistLogged: req.receptionist,
            receptionist: response,
        });
    });
});

router.get("/username/:name", verifyToken, (req, res) => {
    receptionistHelpers
        .checkUsername(req.params.name, req.receptionist.username)
        .then((response) => {
            res.json(response);
        });
});

router.post("/profile/details/:id", verifyLogin, (req, res) => {
    receptionistHelpers
        .editProfileDeatils(req.receptionist._id, req.body)
        .then((response) => {
            res.redirect("/myprofile");
        });
});

router.get("/profile/username", verifyLogin, (req, res) => {
    receptionistHelpers.getMyProfile(req.receptionist._id).then((response) => {
        res.render("receptionist/edit-username", {
            title: "Edit Username",
            receptionistLogged: req.receptionist,
            receptionist: response,
        });
    });
});

router.post("/profile/username/:id", verifyLogin, (req, res) => {
    receptionistHelpers.editUsername(req.receptionist._id, req.body.name).then((response) => {
        res.clearCookie("receptionistToken");
        res.render("receptionist/message", {
            title: "Username Changed",
            message: "You have to relogin to complete the verification",
            redirect: "/login",
        });
    });
});

router.get("/profile/slot-config", verifyLogin, (req, res) => {
    receptionistHelpers.getMySlotConfig(req.receptionist._id).then((response) => {
        console.log(response);
        res.render("receptionist/slot-config", {
            title: "Edit Slot Config",
            receptionistLogged: req.receptionist,
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
    receptionistHelpers
        .upadateSlotConfig(req.receptionist._id, slotConfig)
        .then((response) => {
            res.redirect("/myprofile");
        });
});

router.get("/search", verifyLogin, async(req, res) => {
    let todaysAppointments = await receptionistHelpers.getTodaysAppointment(
        req.receptionist._id
    );
    let upcomingAppointments = await receptionistHelpers.getUpcomingAppointments(
        req.receptionist._id
    );
    let expiredAppointments = await receptionistHelpers.getExipredApointments(
        req.receptionist._id
    );
    let cancelledAppointments = await receptionistHelpers.getCancelledAppointment(
        req.receptionist._id
    );
    let consultedAppointments = await receptionistHelpers.getConsultedAppointments(
        req.receptionist._id
    );
    const options = {
        includeScore: true,
        keys: ["date", "user.name", "user.email", "timeslot"],
    };
    const fuse1 = new Fuse(todaysAppointments, options);
    const fuse2 = new Fuse(upcomingAppointments, options);
    const fuse3 = new Fuse(consultedAppointments, options);
    const fuse4 = new Fuse(cancelledAppointments, options);
    const fuse5 = new Fuse(expiredAppointments, options);
    const result1 = fuse1.search(req.query.q);
    const result2 = fuse2.search(req.query.q);
    const result3 = fuse3.search(req.query.q);
    const result4 = fuse4.search(req.query.q);
    const result5 = fuse5.search(req.query.q);
    res.render("receptionist/search", {
        title: `${req.query.q} - Search`,
        receptionistLogged: req.receptionist,
        search: true,
        query: req.query.q,
        result1,
        result2,
        result3,
        result4,
        result5,
    });
});

router.get("/search/patient", verifyToken, async(req, res) => {
    let allpatients = await receptionistHelpers.getMyPatients(req.receptionist._id);
    let blocked = await receptionistHelpers.getBlocked(req.receptionist._id, allpatients);
    let notBlocked = await receptionistHelpers.removeBlocked(
        req.receptionist._id,
        allpatients
    );
    const options = {
        includeScore: true,
        keys: ["name", "email", "contactno"],
    };
    const fuse1 = new Fuse(notBlocked, options);
    const fuse2 = new Fuse(blocked, options);
    const result1 = fuse1.search(req.query.q);
    const result2 = fuse2.search(req.query.q);
    res.json({ result1, result2 });
});

router.get("/profile/change-password", verifyLogin, async(req, res) => {
    let profileDetails = await receptionistHelpers.getMyProfile(req.receptionist._id);
    var payload = {
        id: req.receptionist._id,
    };
    var token = jwt.sign(payload, process.env.JWT_RESET_PASSWORD, {
        expiresIn: "5m",
    });
    var template = `
  <h2>Change Password</h2>
  <a href="${process.env.receptionist_HOSTNAME}/profile/change-password/${token}">${process.env.receptionist_HOSTNAME}/profile/change-password/${token}</a>
  `;
    sendMail(profileDetails.email, "Change Password", template);
    res.render("receptionist/password-meassage", {
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
                res.render("receptionist/password-meassage", {
                    title: "Link Exipred",
                    message: `The link was exipred the link is only valid for 5 Minutes`,
                });
            } else {
                res.render("receptionist/change-password", {
                    title: "New Password",
                    id: decoded.id,
                });
            }
        }
    );
});

router.post("/profile/change-password", (req, res) => {
    receptionistHelpers.changePassword(req.body).then((response) => {
        res.clearCookie("receptionistToken");
        res.redirect("/");
    });
});

router.get("/forget/password", (req, res) => {
    res.render("receptionist/forget-password", {
        title: "Forget Password",
        error: req.session.resetErr,
    });
    req.session.resetErr = null;
});

router.post("/reset/password/send", (req, res) => {
    receptionistHelpers
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
  <a href="${process.env.receptionist_HOSTNAME}/reset/password/${token}">${process.env.receptionist_HOSTNAME}/reset/password/${token}</a>
  `;
            sendMail(response.email, "Reset Password", template);
            res.render("receptionist/password-meassage", {
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
                res.render("receptionist/password-meassage", {
                    title: "Link Exipred",
                    message: `The link was exipred the link is only valid for 5 Minutes`,
                });
            } else {
                res.render("receptionist/change-password", {
                    title: "New Password",
                    id: decoded.id,
                });
            }
        }
    );
});

router.post("/reset/password", (req, res) => {
    receptionistHelpers.changePassword(req.body).then((response) => {
        res.redirect("/login");
    });
});

router.get("/config/slot", verifyLogin, (req, res) => {
    res.render("receptionist/create-slot-config", {
        title: "Create Slot Config",
        receptionistLogged: req.receptionist,
    });
});

router.post("/config/slot", verifyLogin, (req, res) => {
    var slotConfig = {
        configSlotHours: req.body.slotHours,
        configSlotMinutes: req.body.slotMinutes,
        configSlotPreparation: req.body.slotPreparation,
        timeArr: [{ startTime: req.body.startTime, endTime: req.body.endTime }],
    };
    receptionistHelpers
        .upadateSlotConfig(req.receptionist._id, slotConfig)
        .then((response) => {
            receptionistHelpers
                .getMyProfile(req.receptionist._id)
                .then((data) => {
                    delete data.password;
                    var token = jwt.sign(data, process.env.JWT_SECERT, {
                        expiresIn: "60d",
                    });
                    res.cookie("receptionistToken", token, {
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

router.get("/choose-patient", verifyLogin, async(req, res) => {
    let appointments = await receptionistHelpers.getAppointments();
    res.render("receptionist/choose-patient", {
        title: "Choose Patient",
        receptionistLogged: req.receptionist,
        appointments,
    });
});

router.get("/add-receipt/:id", verifyLogin, async(req, res) => {
    let details = await receptionistHelpers.getOneAppointment(req.params.id);
    let thuoc = await receptionistHelpers.getMedicinesAppointment(req.params.id);
    res.render("receptionist/add-receipt", {
        title: "Add Receipt",
        receptionistLogged: req.receptionist,
        error: req.session.error,
        receipt: req.session.receipt,
        details,
        thuoc,
    });
});

router.post("/add-receipt/:id", verifyLogin, async(req, res) => {
    receptionistHelpers
        .addReceipt(req.receptionist._id, req.params.id, req.body)
        .then((response) => {
            receptionistHelpers.changeAppointmentStatus(req.params.id, "Exported");
            console.log("Thêm thành công");
            res.redirect("/");
        })
        .catch((error) => {
            req.session.adderror = error.msg;
            req.session.receipt = req.body;
            res.redirect("/");
        });
});
module.exports = router;