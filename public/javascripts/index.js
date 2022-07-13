var search = document.getElementById("search");
var searchbtn = document.getElementById("search-btn");
var container = document.getElementById("doctors");
var initial = container.innerHTML;
search.addEventListener("keyup", (event) => {
    container.innerHTML = "";
    var section = "";
    if (event.target.value === "") {
        container.innerHTML = initial;
    } else {
        fetch(`/search/doctors?q=${event.target.value}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((res) => res.json())
            .then((res) => {
                if (res.length == 0) {
                    return (container.innerHTML = "<h1>Không tìm thấy</h1>");
                }
                res.forEach((element) => {
                    section += `
            <div class="container">
            <div class="img-section">
              <img src="${element.item.img}" alt="" />
            </div>
            <div class="content">
              <p>
                ${element.item.name}
              </p>
              <p>
                ${element.item.field}
              </p>
              <p>
                ${element.item.specialised}
              </p>
              <div class="btn-grp" style="margin-left: 0; font-size: 16px">
                <a href="/book-appoinment/${element.item._id}">
                  <button class="crop" style="font-size: 15px">
                    Lịch hẹn
                  </button>
                </a>
              </div>
            </div>
          </div>
            `;
                });
                container.innerHTML = section;
            });
    }
});

searchbtn.addEventListener("click", (event) => {
    container.innerHTML = "";
    var section = "";
    if (search.value === "") {
        container.innerHTML = initial;
    } else {
        fetch(`/search/doctors?q=${event.target.value}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((res) => res.json())
            .then((res) => {
                if (res.length == 0) {
                    return (container.innerHTML = "<h1>Không tìm thấy</h1>");
                }
                res.forEach((element) => {
                    section += `
            <div class="container">
            <div class="img-section">
              <img src="${element.item.img}" alt="" />
            </div>
            <div class="content">
              <p>
                ${element.item.name}
              </p>
              <p>
                ${element.item.field}
              </p>
              <p>
                ${element.item.specialised}
              </p>
              <div class="btn-grp" style="margin-left: 0; font-size: 16px">
                <a href="/book-appoinment/${element.item._id}">
                  <button class="crop" style="font-size: 15px">
                    Lịch hẹn
                  </button>
                </a>
              </div>
            </div>
          </div>
            `;
                });
                container.innerHTML = section;
            });
    }
});