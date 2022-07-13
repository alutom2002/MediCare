const menu = document.querySelector(".menu");

if (menu) {
    menu.addEventListener("click", () => {
        const sidebar = document.querySelector(".sidebar");
        const adminDash = document.querySelector(".ml-250");
        menu.classList.toggle("active");
        sidebar.classList.toggle("active");
        adminDash.classList.toggle("active");
    });
}
var userid;
var remove;

function modalup(modal, id, remove) {
    userid = id;
    document.querySelector("." + modal).classList.toggle("active");
}

const doctorDelete = document.querySelector("#doctor-delete");
const patientDelete = document.querySelector("#patient-delete");
const pharmacistDelete = document.querySelector("#pharmacist-delete");
const receptionistDelete = document.querySelector("#receptionist-delete");
const medicineDelete = document.querySelector("#medicine-delete");

if (doctorDelete) {
    doctorDelete.addEventListener("click", deleteDoctor);
}
if (receptionistDelete) {
    receptionistDelete.addEventListener("click", deleteReceptionist);
}
if (pharmacistDelete) {
    pharmacistDelete.addEventListener("click", deletePharmacist);
}
if (patientDelete) {
    patientDelete.addEventListener("click", deletePatient);
}
if (medicineDelete) {
    medicineDelete.addEventListener("click", deleteMedicine);
}

function toogleTab(activeTab, inactiveTab, showContent, hideContent) {
    document.querySelector(activeTab).classList.add("active");
    document.querySelector(showContent).classList.add("active");
    document.querySelector(inactiveTab).classList.remove("active");
    document.querySelector(hideContent).classList.remove("active");
}

function toogleTab3(
    activeTab,
    inactiveTab1,
    inactiveTab2,
    inactiveTab3,
    showContent,
    hideContent1,
    hideContent2,
    hideContent3,
    inactiveTab4,
    hideContent4
) {
    document.querySelector(activeTab).classList.add("active");
    document.querySelector(showContent).classList.add("active");
    document.querySelector(inactiveTab1).classList.remove("active");
    document.querySelector(inactiveTab2).classList.remove("active");
    document.querySelector(inactiveTab3).classList.remove("active");
    document.querySelector(hideContent1).classList.remove("active");
    document.querySelector(hideContent2).classList.remove("active");
    document.querySelector(hideContent3).classList.remove("active");
    if (inactiveTab4 && hideContent4) {
        document.querySelector(inactiveTab4).classList.remove("active");
        document.querySelector(hideContent4).classList.remove("active");
    }
}

function deleteDoctor() {
    fetch(`/doctors/${userid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((res) => {
            if (res.status) {
                console.log(res.status);
                document.getElementById(`${userid}`).remove();
                modalup("delete-sucess-modal");
                document.querySelector(".doctor-modal").classList.toggle("active");
            } else {
                alert("Something Went Wrong. Try Again Later");
                location.reload();
            }
        });
}

function deletePharmacist() {
    fetch(`/pharmacist/${userid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((res) => {
            if (!res.status) {
                document.getElementById(`${userid}`).remove();
                modalup("delete-sucess-modal");
                document.querySelector(".pharmacist-modal").classList.toggle("active");
            } else {
                alert("Something Went Wrong. Try Again Later");
                location.reload();
            }
        });
}

function deleteReceptionist() {
    fetch(`/receptionist/${userid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((res) => {
            if (!res.status) {
                document.getElementById(`${userid}`).remove();
                modalup("delete-sucess-modal");
                document.querySelector(".receptionist-modal").classList.toggle("active");
            } else {
                alert("Something Went Wrong. Try Again Later");
                location.reload();
            }
        });
}

function deletePatient() {
    fetch(`/patients/${userid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((res) => {
            if (res.status) {
                document.getElementById(`${userid}`).remove();
                modalup("delete-sucess-modal");
                document.querySelector(".patient-modal").classList.toggle("active");
            } else {
                alert("Something Went Wrong. Try Again Later");
                location.reload();
            }
        });
}

function deleteMedicine() {
    fetch(`/medicine/${userid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((res) => {
            if (res.status) {
                document.getElementById(`${userid}`).remove();
                modalup("delete-sucess-modal");
                document.querySelector(".medicine-modal").classList.toggle("active");
            } else {
                alert("Something Went Wrong. Try Again Later");
                location.reload();
            }
        });
}

var notfication = document.createElement("div");
notfication.classList.add("notfication-container");

document.body.appendChild(notfication);

var total = document.querySelector('input[name="total"]');
var prices = document.querySelectorAll('.medicine-price');
var sum = 0;

for (let i = 0; i < prices.length; i++) {
    sum += parseInt(prices[i].getAttribute('price'));
    total.value = sum;
}