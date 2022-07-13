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
                .collection(collection.PHARMACIST_COLLECTION)
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
    getMyProfile: (pharmacistId) => {
        return new Promise(async(resolve, reject) => {
            let profile = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
                .findOne({ _id: ObjectId(pharmacistId) });
            resolve(profile);
        });
    },
    getMyProfileEmail: (email) => {
        return new Promise(async(resolve, reject) => {
            let profile = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
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
                .collection(collection.PHARMACIST_COLLECTION)
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
                .collection(collection.PHARMACIST_COLLECTION)
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
                .collection(collection.PHARMACIST_COLLECTION)
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
    addMedicine: (details) => {
        return new Promise(async(resolve, reject) => {
            db.get()
                .collection(collection.MEDICINES_COLLECTION)
                .insertOne(details)
                .then((data) => {
                    resolve(data.ops[0]);
                });
        });
    },
    getMedicines: () => {
        return new Promise(async(resolve, reject) => {
            let medicines = await db
                .get()
                .collection(collection.MEDICINES_COLLECTION)
                .find({ status: "Avaiable" })
                .toArray()
            resolve(medicines);
        });
    },
    deleteMedicine: (medicinesId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.MEDICINES_COLLECTION)
                .deleteOne({ _id: ObjectId(medicinesId) })
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
    getOneMedicine: (medicinesId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.MEDICINES_COLLECTION)
                .findOne({ _id: ObjectId(medicinesId) })
                .then((response) => {
                    resolve(response);
                });
        });
    },
    updateMedicine: (medicinesId, details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.MEDICINES_COLLECTION)
                .updateOne({ _id: ObjectId(medicinesId) }, {
                    $set: {
                        name: details.name,
                        price: details.price,
                        amount: details.amount,
                        measurementUnit: details.measurementUnit,
                    },
                })
                .then((respone) => {
                    resolve();
                });
        });
    },
    getMySlotConfig: (pharmacistId) => {
        return new Promise(async(resolve, reject) => {
            let slotConfig = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
                .findOne({ _id: ObjectId(pharmacistId) }, {
                    projection: { _id: 0, slotConfig: 1 },
                });
            resolve(slotConfig);
        });
    },
    upadateSlotConfig: (pharmacistId, slotConfig) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PHARMACIST_COLLECTION)
                .updateOne({ _id: ObjectId(pharmacistId) }, {
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
                .collection(collection.PHARMACIST_COLLECTION)
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
    checkUserStatus: (pharmacistId) => {
        return new Promise(async(resolve, reject) => {
            let user = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
                .findOne({
                    _id: ObjectId(pharmacistId),
                });
            if (user.status === "Active") {
                resolve();
            } else {
                reject();
            }
        });
    },
};