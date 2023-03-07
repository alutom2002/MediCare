const db = require("../config/connection");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

module.exports = {
    doLogin: (Data) => {
        return new Promise(async(resolve, reject) => {
            let admin = await db
                .get()
                .collection(collection.ADMIN_COLLECTION)
                .findOne({ email: Data.email });
            if (admin) {
                bcrypt.compare(Data.password, admin.password).then((status) => {
                    if (status) {
                        resolve(admin);
                    } else {
                        reject({ msg: "Mật khẩu không hợp lệ" });
                    }
                });
            } else {
                reject({ msg: "Email không hợp lệ" });
            }
        });
    },
    checkUsername: (username) => {
        return new Promise(async(resolve, reject) => {
            let userNameDb = await db
                .get()
                .collection(collection.DOCTORS_COLLECTION)
                .find({
                    $and: [
                        { username: username },
                        { $or: [{ status: "Active" }, { status: "Blocked" }] },
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
    /* -----------------Begin Doctor----------------- */
    addDoctor: (details) => {
        return new Promise(async(resolve, reject) => {
            details.status = "Active";
            details.blockedUsers = [];
            let emailFound1 = await db
                .get()
                .collection(collection.DOCTORS_COLLECTION)
                .find({
                    $and: [
                        { email: details.email },
                        { $or: [{ status: "Active" }, { status: "Blocked" }] },
                    ],
                })
                .toArray();
            if (emailFound1.length <= 0) {
                details.password = await bcrypt.hash('password', 10);
                db.get()
                    .collection(collection.DOCTORS_COLLECTION)
                    .insertOne(details)
                    .then((data) => {
                        resolve(data.ops[0]);
                    });
            } else {
                reject({ msg: "Email Id Already Exists" });
            }
        });
    },
    getDoctors: () => {
        return new Promise(async(resolve, reject) => {
            let doctors = await db
                .get()
                .collection(collection.DOCTORS_COLLECTION)
                .find({ status: "Active" })
                .toArray();
            resolve(doctors);
        });
    },
    deleteDoctor: (doctorId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.DOCTORS_COLLECTION)
                .updateOne({ _id: ObjectId(doctorId) }, {
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
    getOneDoctor: (username) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.DOCTORS_COLLECTION)
                .findOne({ username: username })
                .then((response) => {
                    resolve(response);
                });
        });
    },
    updateDoctor: (username, details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.DOCTORS_COLLECTION)
                .updateOne({ username: username }, {
                    $set: {
                        name: details.name,
                        email: details.email,
                        specialised: details.specialised,
                        field: details.field,
                        gender: details.gender,
                    },
                })
                .then((respone) => {
                    resolve();
                });
        });
    },
    /* -----------------End Doctor----------------- */
    /* -----------------Begin Pharmacist----------------- */
    addPharmacist: (details) => {
        return new Promise(async(resolve, reject) => {
            details.status = "Active";
            let emailFound2 = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
                .find({
                    $and: [
                        { email: details.email },
                        { $or: [{ status: "Active" }, { status: "Blocked" }] },
                    ],
                })
                .toArray();
            if (emailFound2.length <= 0) {
                details.password = await bcrypt.hash('password', 10);
                db.get()
                    .collection(collection.PHARMACIST_COLLECTION)
                    .insertOne(details)
                    .then((data) => {
                        resolve(data.ops[0]);
                    });
            } else {
                reject({ msg: "Email Id Already Exists" });
            }
        });
    },
    getPharmacist: () => {
        return new Promise(async(resolve, reject) => {
            let pharmacist = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
                .find({ status: "Active" })
                .toArray();
            resolve(pharmacist);
        });
    },
    deletePharmacist: (pharmacistId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PHARMACIST_COLLECTION)
                .updateOne({ _id: ObjectId(pharmacistId) }, {
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
    getOnePharmacist: (username) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PHARMACIST_COLLECTION)
                .findOne({ username: username })
                .then((response) => {
                    resolve(response);
                });
        });
    },
    updatePharmacist: (username, details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PHARMACIST_COLLECTION)
                .updateOne({ username: username }, {
                    $set: {
                        name: details.name,
                        email: details.email,
                        gender: details.gender,
                    },
                })
                .then((respone) => {
                    resolve();
                });
        });
    },
    blockPharmacist: (pharmacistId, status) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PHARMACIST_COLLECTION)
                .updateOne({ _id: ObjectId(pharmacistId) }, {
                    $set: {
                        status: status,
                    },
                })
                .then((res) => {
                    resolve(true);
                });
        });
    },
    getBlockedPharmacist: () => {
        return new Promise(async(resolve, reject) => {
            let pharmacist = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
                .find({ status: "Blocked" })
                .toArray();
            resolve(pharmacist);
        });
    },
    /* -----------------End Pharmacist----------------- */
    /* -----------------Begin Receptionist----------------- */
    addReceptionist: (details) => {
        return new Promise(async(resolve, reject) => {
            details.status = "Active";
            let emailFound3 = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .find({
                    $and: [
                        { email: details.email },
                        { $or: [{ status: "Active" }, { status: "Blocked" }] },
                    ],
                })
                .toArray();
            if (emailFound3.length <= 0) {
                details.password = await bcrypt.hash('password', 10);
                db.get()
                    .collection(collection.RECEPTIONIST_COLLECTION)
                    .insertOne(details)
                    .then((data) => {
                        resolve(data.ops[0]);
                    });
            } else {
                reject({ msg: "Email Id Already Exists" });
            }
        });
    },
    getReceptionist: () => {
        return new Promise(async(resolve, reject) => {
            let receptionist = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .find({ status: "Active" })
                .toArray();
            resolve(receptionist);
        });
    },
    deleteReceptionist: (receptionistId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .updateOne({ _id: ObjectId(receptionistId) }, {
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
    getOneReceptionist: (username) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .findOne({ username: username })
                .then((response) => {
                    resolve(response);
                });
        });
    },
    updateReceptionist: (username, details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .updateOne({ username: username }, {
                    $set: {
                        name: details.name,
                        email: details.email,
                        gender: details.gender,
                    },
                })
                .then((respone) => {
                    resolve();
                });
        });
    },
    blockReceptionist: (receptionistId, status) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .updateOne({ _id: ObjectId(receptionistId) }, {
                    $set: {
                        status: status,
                    },
                })
                .then((res) => {
                    resolve(true);
                });
        });
    },
    getBlockedReceptionist: () => {
        return new Promise(async(resolve, reject) => {
            let receptionist = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .find({ status: "Blocked" })
                .toArray();
            resolve(receptionist);
        });
    },
    /* -----------------End Receptionist----------------- */
    /* -----------------Begin Medicines----------------- */
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
    /* -----------------End Medicines----------------- */
    /* -----------------Begin Receipt----------------- */
    getCustomers: () => {
        return new Promise(async(resolve, reject) => {
            let patients = await db
                .get()
                .collection(collection.RECEIPT_COLLECTION)
                .aggregate([{
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
    /* -----------------End Receipt----------------- */
    /* -----------------Begin Patient----------------- */
    addPatient: (details) => {
        return new Promise(async(resolve, reject) => {
            let mailFound;
            if (details.email) {
                mailFound = await db
                    .get()
                    .collection(collection.PATIENT_COLLECTION)
                    .find({
                        $and: [{
                                email: details.email,
                            },
                            { $or: [{ status: "Active" }, { status: "Blocked" }] },
                        ],
                    })
                    .toArray();
                console.log(details.password);
                details.password = await bcrypt.hash('password', 10);
                console.log(details.password);
            } else {
                mailFound = await db
                    .get()
                    .collection(collection.PATIENT_COLLECTION)
                    .find({
                        $and: [{
                                contactno: details.contactno,
                            },
                            { $or: [{ status: "Active" }, { status: "Blocked" }] },
                        ],
                    })
                    .toArray();
            }
            if (mailFound.length <= 0) {
                details.status = "Active";
                details.auth = "Password";
                db.get()
                    .collection(collection.PATIENT_COLLECTION)
                    .insertOne(details)
                    .then((data) => {
                        resolve(data.ops[0]);
                    });
            } else {
                reject({ msg: "Email Id or Contact No Already Exists" });
            }
        });
    },
    getPatients: () => {
        return new Promise(async(resolve, reject) => {
            let patients = await db
                .get()
                .collection(collection.PATIENT_COLLECTION)
                .find({ status: "Active" })
                .toArray();
            resolve(patients);
        });
    },
    deletepatient: (patientId) => {
        return new Promise(async(resolve, reject) => {
            db.get()
                .collection(collection.PATIENT_COLLECTION)
                .updateOne({ _id: ObjectId(patientId) }, {
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
    getOnePatient: (patientId) => {
        return new Promise(async(resolve, reject) => {
            let patient = await db
                .get()
                .collection(collection.PATIENT_COLLECTION)
                .findOne({ _id: ObjectId(patientId) });
            resolve(patient);
        });
    },
    updatePatient: (patientId, details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PATIENT_COLLECTION)
                .updateOne({ _id: ObjectId(patientId) }, {
                    $set: {
                        name: details.name,
                        email: details.email,
                        contactno: details.contactno,
                        age: details.age,
                        gender: details.gender,
                    },
                })
                .then((response) => {
                    resolve();
                });
        });
    },
    /* -----------------End Patient----------------- */
    getCounts: () => {
        return new Promise(async(resolve, reject) => {
            let doctorsCount = await db
                .get()
                .collection(collection.DOCTORS_COLLECTION)
                .countDocuments({ status: "Active" });
            let pharmacistCount = await db
                .get()
                .collection(collection.PHARMACIST_COLLECTION)
                .countDocuments({ status: "Active" });
            let receptionistCount = await db
                .get()
                .collection(collection.RECEPTIONIST_COLLECTION)
                .countDocuments({ status: "Active" });
            let patientsCount = await db
                .get()
                .collection(collection.PATIENT_COLLECTION)
                .countDocuments({ status: "Active" });
            let appointmentsCount = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments();
            let medicinesCount = await db
                .get()
                .collection(collection.MEDICINES_COLLECTION)
                .countDocuments();
            let receiptsCount = await db
                .get()
                .collection(collection.RECEIPT_COLLECTION)
                .countDocuments();

            resolve({ doctorsCount, pharmacistCount, receptionistCount, patientsCount, appointmentsCount, medicinesCount, receiptsCount });
        });
    },
    /* -----------------Begin Block----------------- */
    blockDoctor: (doctorId, status) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.DOCTORS_COLLECTION)
                .updateOne({ _id: ObjectId(doctorId) }, {
                    $set: {
                        status: status,
                    },
                })
                .then((res) => {
                    resolve(true);
                });
        });
    },
    blockPatient: (userId, status) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.PATIENT_COLLECTION)
                .updateOne({ _id: ObjectId(userId) }, {
                    $set: {
                        status: status,
                    },
                })
                .then((res) => {
                    resolve(true);
                });
        });
    },
    getBlockedDoctors: () => {
        return new Promise(async(resolve, reject) => {
            let doctors = await db
                .get()
                .collection(collection.DOCTORS_COLLECTION)
                .find({ status: "Blocked" })
                .toArray();
            resolve(doctors);
        });
    },
    getBlockedPatients: () => {
        return new Promise(async(resolve, reject) => {
            let doctors = await db
                .get()
                .collection(collection.PATIENT_COLLECTION)
                .find({ status: "Blocked" })
                .toArray();
            resolve(doctors);
        });
    },
    /* -----------------End Block----------------- */
    /* -----------------Begin Appointment----------------- */
    getTodaysAppointment: (doctorId) => {
        return new Promise(async(resolve, reject) => {
            let date = new Date().toDateString();
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { doctor: ObjectId(doctorId) },
                                { status: "Approved" },
                                { date: date },
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
                ])
                .toArray();
            resolve(appointment);
        });
    },
    getUpcomingAppointments: (doctorId) => {
        return new Promise(async(resolve, reject) => {
            let date = new Date().toDateString();
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { doctor: ObjectId(doctorId) },
                                { status: "Approved" },
                                { date: { $ne: date } },
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
                ])
                .toArray();
            let result = [];
            appointment.forEach((element) => {
                var today = new Date();
                var dbDate = new Date(element.date);
                if (dbDate > today) {
                    result.push(element);
                }
            });
            resolve(result);
        });
    },
    getExipredApointments: (doctorId) => {
        return new Promise(async(resolve, reject) => {
            let date = new Date().toDateString();
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { doctor: ObjectId(doctorId) },
                                { status: { $ne: "Deleted" } },
                                { date: { $ne: date } },
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
                ])
                .toArray();
            let result = [];
            appointment.forEach((element) => {
                var today = new Date();
                var dbDate = new Date(element.date);
                if (dbDate < today) {
                    result.push(element);
                }
            });
            resolve(result);
        });
    },
    getCancelledAppointment: (doctorId) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{
                                    doctor: ObjectId(doctorId),
                                },
                                {
                                    status: "Deleted",
                                },
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
                ])
                .toArray();
            resolve(appointment);
        });
    },
    getConsultedAppointments: (doctorId) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{
                                    doctor: ObjectId(doctorId),
                                },
                                {
                                    status: "Consulted",
                                },
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
                ])
                .toArray();
            resolve(appointment);
        });
    },
    getPendingAppointments: (doctorId) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{
                                    doctor: ObjectId(doctorId),
                                },
                                {
                                    status: "Pending",
                                },
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
                ])
                .toArray();
            let result = [];
            appointment.forEach((element) => {
                var today = new Date();
                today = new Date(today).setHours(0, 0, 0, 0);
                var dbDate = new Date(element.date);
                if (dbDate >= today) {
                    result.push(element);
                }
            });
            resolve(result);
        });
    },
    getUpcomingAppointmentsByDate: (doctorId, date) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { doctor: ObjectId(doctorId) },
                                { status: "Approved" },
                                { date: date },
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
                ])
                .toArray();
            let result = [];
            appointment.forEach((element) => {
                var today = new Date();
                var dbDate = new Date(element.date);
                if (dbDate > today) {
                    result.push(element);
                }
            });
            resolve(result);
        });
    },
    getExipredApointmentsByDate: (doctorId, date) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [
                                { doctor: ObjectId(doctorId) },
                                { status: { $ne: "Deleted" } },
                                { date: date },
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
                ])
                .toArray();
            let result = [];
            appointment.forEach((element) => {
                var today = new Date();
                var dbDate = new Date(element.date);
                if (dbDate < today) {
                    result.push(element);
                }
            });
            resolve(result);
        });
    },
    getCancelledAppointmentByDate: (doctorId, date) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{
                                    doctor: ObjectId(doctorId),
                                },
                                {
                                    status: "Deleted",
                                },
                                {
                                    date: date,
                                },
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
                ])
                .toArray();
            resolve(appointment);
        });
    },
    getConsultedAppointmentsByDate: (doctorId, date) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{
                                    doctor: ObjectId(doctorId),
                                },
                                {
                                    status: "Consulted",
                                },
                                {
                                    date: date,
                                },
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
                ])
                .toArray();
            resolve(appointment);
        });
    },
    getPendingAppointmentsByDate: (doctorId, date) => {
        return new Promise(async(resolve, reject) => {
            let appointment = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{
                                    doctor: ObjectId(doctorId),
                                },
                                {
                                    status: "Pending",
                                },
                                {
                                    date: date,
                                },
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
                ])
                .toArray();
            resolve(appointment);
        });
    },
    getCountsOfAppontments: (doctorId) => {
        return new Promise(async(resolve, reject) => {
            let total = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments({ doctor: ObjectId(doctorId) });
            let approved = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments({
                    $and: [{ doctor: ObjectId(doctorId) }, { status: "Approved" }],
                });
            let pending = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments({
                    $and: [{ doctor: ObjectId(doctorId) }, { status: "Pending" }],
                });
            let consulted = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments({
                    $and: [{ doctor: ObjectId(doctorId) }, { status: "Consulted" }],
                });
            let deleted = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments({
                    $and: [{ doctor: ObjectId(doctorId) }, { status: "Deleted" }],
                });
            resolve({ total, approved, pending, consulted, deleted });
        });
    },
    /* -----------------End Appointmet----------------- */
    getMyProfile: (email) => {
        return new Promise(async(resolve, reject) => {
            let profile = await db
                .get()
                .collection(collection.ADMIN_COLLECTION)
                .find({ email: email })
                .toArray();
            if (profile.length > 0) {
                resolve(profile[0]);
            } else {
                reject({ msg: "Wrong Email Id" });
            }
        });
    },
    editProfile: (id, details) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ADMIN_COLLECTION)
                .updateOne({ _id: ObjectId(id) }, {
                    $set: {
                        name: details.name,
                        email: details.email,
                    },
                })
                .then((response) => {
                    resolve();
                });
        });
    },
    changePassword: (details) => {
        return new Promise(async(resolve, reject) => {
            details.password = await bcrypt.hash(details.password, 10);
            db.get()
                .collection(collection.ADMIN_COLLECTION)
                .updateOne({ _id: ObjectId(details.id) }, {
                    $set: {
                        password: details.password,
                    },
                })
                .then((response) => {
                    console.log(details.id);
                    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa");
                    console.log(details.password);
                    resolve();
                });
        });
    },
    getMyPatients: (doctorId, date) => {
        return new Promise(async(resolve, reject) => {
            let patients = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .aggregate([{
                        $match: {
                            $and: [{ doctor: ObjectId(doctorId) }, { date: date }],
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
                    { $match: { count: { $gt: 1 } } },
                ])
                .toArray();
            if (patients.length != 0) {
                var id = patients[0].uniqueIds;
                var result = [];
                for (let i = 0; i < id.length; i++) {
                    result[i] = await db
                        .get()
                        .collection(collection.PATIENT_COLLECTION)
                        .findOne({ _id: ObjectId(id[i]) });
                }
                resolve(result);
            } else {
                resolve([]);
            }
        });
    },
    getDoctorStats: (doctorId, date, patients) => {
        return new Promise(async(resolve, reject) => {
            let totalAppointments = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments({ doctor: ObjectId(doctorId) });
            let requestedAppointments = await db
                .get()
                .collection(collection.APPOINTMENT_COLLECTION)
                .countDocuments({ doctor: ObjectId(doctorId), date: date });
            let aPercentage = (requestedAppointments / totalAppointments) * 100;
            let pPercentage = (patients.length / totalAppointments) * 100;
            let result = [{
                    label: "Appointments",
                    value: Math.floor(aPercentage),
                },
                {
                    label: "Patient",
                    value: Math.floor(pPercentage),
                },
            ];
            if (aPercentage === 0 && pPercentage === 0) {
                return resolve([]);
            }
            resolve(result);
        });
    },
};