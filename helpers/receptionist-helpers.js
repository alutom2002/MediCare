const db = require("../config/connection");
const collection = require("../config/collection");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
/* const { sendMail } = require("./send-mail");
const { sendMessage } = require("./sms-send"); */

module.exports = {
    dologin: (deatils) => {
        return new Promise(async(resolve, reject) => {
            let emailFound = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .find({
                    $and: [
                        { username: deatils.usrname },
                        { $or: [{ status: "Active" }, { status: "Blocked" }] },
                    ],
                })
                .toArray();
            if (emailFound.length > 0) {
                if (emailFound[0].status === "Blocked") {
                    reject({ msg: "Your Account is temporarliy disbaled" });
                }
                bcrypt
                    .compare(deatils.password, emailFound[0].password)
                    .then((status) => {
                        if (status) {
                            resolve(emailFound[0]);
                        } else {
                            reject({ msg: "Tên đăng nhập hoặc mật khẩu không hợp lệ" });
                        }
                    })
                    .catch((err) => {
                        if (err) throw err;
                    });
            } else {
                reject({ msg: "Tên đăng nhập hoặc mật khẩu không hợp lệ" });
            }
        });
    },
    getMyProfile: (receptionistId) => {
        return new Promise(async(resolve, reject) => {
            let profile = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .findOne({ _id: ObjectId(receptionistId) });
            resolve(profile);
        });
    },
    getMyProfileEmail: (email) => {
        return new Promise(async(resolve, reject) => {
            let profile = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .find({ email: email })
                .toArray();
            if (profile.length > 0) {
                resolve(profile[0]);
            } else {
                reject({ msg: "User Not Found" });
            }
        });
    },
    checkUsername: (username, currentUsername) => {
        return new Promise(async(resolve, reject) => {
            let userNameDb = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .find({
                    $and: [
                        { username: username },
                        { status: "Active" },
                        { username: { $ne: currentUsername } },
                    ],
                })
                .toArray();
            if (userNameDb.length > 0) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    },
    editProfileDeatils: (id, deatils) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .updateOne({ _id: ObjectId(id) }, {
                    $set: {
                        name: deatils.name,
                        email: deatils.email,
                        gender: deatils.gender,
                    },
                })
                .then((res) => {
                    resolve();
                });
        });
    },
    editUsername: (id, name) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .updateOne({ _id: ObjectId(id) }, {
                    $set: {
                        username: name,
                    },
                })
                .then((response) => {
                    resolve();
                });
        });
    },
    /* Receipts */
    getAppointments: () => {
        return new Promise(async(resolve, reject) => {
            let appointments = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { status: "Consulted" },
                                { receipt: "Pending" },
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PATIENT_COLLECTION,
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
                        },

                    },
                    {
                        $unwind: "$user",
                    },
                    {
                        $lookup: {
                            from: collection.DOCTORS_COLLECTION,
                            localField: "doctor",
                            foreignField: "_id",
                            as: "doctor",
                        },
                    },
                    {
                        $unwind: "$doctor",
                    },
                    /* {
                        $lookup: {
                            from: collection.MEDICINES_COLLECTION,
                            localField: "medicines",
                            foreignField: "name",
                            as: "medicines",
                        },
                    },
                    {
                        $unwind: "$medicines",
                    }, */
                ])
                .toArray();
            resolve(appointments);
        });

    },
    getOneAppointment: (appointmentId) => {
        return new Promise(async(resolve, reject) => {
            let history = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { _id: ObjectId(appointmentId) },
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PATIENT_COLLECTION,
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $unwind: "$user",
                    },
                    {
                        $lookup: {
                            from: collection.DOCTORS_COLLECTION,
                            localField: "doctor",
                            foreignField: "_id",
                            as: "doctor",
                        },
                    },
                    {
                        $unwind: "$doctor",
                    },
                ])
                .toArray();
            resolve(history);
        });
    },
    getMedicinesAppointment: (appointmentId) => {
        return new Promise(async(resolve, reject) => {
            let history = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { _id: ObjectId(appointmentId) },
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: collection.MEDICINES_COLLECTION,
                            localField: "medicines",
                            foreignField: "name",
                            as: "thuoc",
                        },
                    },
                    {
                        $unwind: "$thuoc",
                    },
                    {
                        $project: {
                            _id: 0,
                            thuoc: 1,
                        },
                    },
                ])
                .toArray();
            resolve(history);
        });
    },
    getReceiptsHistory: (userId) => {
        return new Promise(async(resolve, reject) => {
            let history = await db
                .get()
                .collection(collection.RECEIPT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { user: ObjectId(userId) },
                                { status: "Exported" },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PATIENT_COLLECTION,
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $unwind: "$user",
                    },
                    {
                        $lookup: {
                            from: collection.DOCTORS_COLLECTION,
                            localField: "doctor",
                            foreignField: "_id",
                            as: "doctor",
                        },
                    },
                    {
                        $unwind: "$doctor",
                    },
                    {
                        $lookup: {
                            from: collection.RECEPTIONIST_COLLECTION,
                            localField: "receptionist",
                            foreignField: "_id",
                            as: "receptionist",
                        },
                    },
                    {
                        $unwind: "$receptionist",
                    },
                ])
                .toArray();
            resolve(history);
        });
    },
    addReceipt: (receptionistId, appointmentId, details) => {
        return new Promise(async(resolve, reject) => {
            db.get()
                .collection(collection.RECEIPT_COLLECTION)
                .insertOne({
                    appointment: ObjectId(appointmentId),
                    receptionist: ObjectId(receptionistId),
                    doctor: ObjectId(details.doctor),
                    user: ObjectId(details.user),
                    date: details.date,
                    timeslot: details.timeslot,
                    medicines: details.medicines,
                    notes: details.notes,
                    total: details.total,
                    status: "Exported",
                })
                .then((data) => {
                    resolve(data.ops[0]);
                });
        });
    },
    changeAppointmentStatus: (appointmentId, status) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .updateOne({ _id: ObjectId(appointmentId) }, {
                    $set: {
                        receipt: status,
                    },
                })
                .then((response) => {
                    console.log("đổi trạng thái thành công aaaaaaaaaaa");
                    resolve();
                });
        });
    },
    deleteReceipts: (receiptId) => {
        return new Promise(async(resolve, reject) => {
            db.get()
                .collection(collection.RECEIPT_COLLECTION)
                .updateOne({ _id: ObjectId(receiptId) }, {
                    $set: {
                        status: "Deleted",
                    },
                })
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
    /* Customer */
    getMyCustomers: (receptionistId) => {
        return new Promise(async(resolve, reject) => {
            let patients = await db
                .get()
                .collection(collection.RECEIPT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{ receptionist: ObjectId(receptionistId) }],
                        },
                    },
                    {
                        $lookup: {
                            from: collection.PATIENT_COLLECTION,
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
                        },
                    },
                    {
                        $unwind: "$user",
                    },
                    {
                        $project: {
                            _id: 0,
                            user: 1,
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            uniqueIds: { $addToSet: "$user._id" },
                            count: { $sum: 1 },
                        },
                    },
                ])
                .toArray();
            var result = [];
            if (patients.length != 0) {
                var id = patients[0].uniqueIds;
                for (let i = 0; i < id.length; i++) {
                    result[i] = await db
                        .get()
                        .collection(collection.PATIENT_COLLECTION)
                        .findOne({ _id: ObjectId(id[i]) })
                }
            }
            resolve(result);
        });
    },
    getMySlotConfig: (receptionistId) => {
        return new Promise(async(resolve, reject) => {
            let slotConfig = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .findOne({ _id: ObjectId(receptionistId) }, {
                    projection: { _id: 0, slotConfig: 1 },
                });
            resolve(slotConfig);
        });
    },
    upadateSlotConfig: (receptionistId, slotConfig) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .updateOne({ _id: ObjectId(receptionistId) }, {
                    $set: {
                        slotConfig: slotConfig,
                    },
                });
            resolve();
        });
    },
    changePassword: (details) => {
        return new Promise(async(resolve, reject) => {
            details.password = await bcrypt.hash(details.password, 10);
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .updateOne({ _id: ObjectId(details.id) }, {
                    $set: {
                        password: details.password,
                    },
                })
                .then((response) => {
                    resolve();
                });
        });
    },
    checkUserStatus: (receptionistId) => {
        return new Promise(async(resolve, reject) => {
            let user = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .findOne({
                    _id: ObjectId(receptionistId),
                });
            if (user.status === "Active") {
                resolve();
            } else {
                reject();
            }
        });
    },
};