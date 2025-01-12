const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
    const cached = localStorage.getItem(path);
    if (cached) {
        $(selector).innerHTML = cached;
    }

    fetch(path)
        .then((res) => res.text())
        .then((html) => {
            if (html !== cached) {
                $(selector).innerHTML = html;
                localStorage.setItem(path, html);
            }
        })
        .finally(() => {
            window.dispatchEvent(new Event("template-loaded"));
        });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
    if (!element) return true;

    if (window.getComputedStyle(element).display === "none") {
        return true;
    }

    let parent = element.parentElement;
    while (parent) {
        if (window.getComputedStyle(parent).display === "none") {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
    if (isHidden($(".js-dropdown-list"))) return;

    const items = $$(".js-dropdown-list > li");

    items.forEach((item) => {
        const arrowPos = item.offsetLeft + item.offsetWidth / 2;
        item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
    });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener("resize", calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener("template-loaded", calArrowPos);

/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener("template-loaded", handleActiveMenu);

function handleActiveMenu() {
    const dropdowns = $$(".js-dropdown");
    const menus = $$(".js-menu-list");
    const activeClass = "menu-column-link--active";

    const removeActive = (menu) => {
        menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
    };

    const init = () => {
        menus.forEach((menu) => {
            const items = menu.children;
            if (!items.length) return;

            removeActive(menu);
            if (window.innerWidth > 991) items[0].classList.add(activeClass);

            Array.from(items).forEach((item) => {
                item.onmouseenter = () => {
                    if (window.innerWidth <= 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                };
                item.onclick = () => {
                    if (window.innerWidth > 991) return;
                    removeActive(menu);
                    item.classList.add(activeClass);
                    item.scrollIntoView();
                };
            });
        });
    };

    init();

    dropdowns.forEach((dropdown) => {
        dropdown.onmouseleave = () => init();
    });
}

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener("template-loaded", initJsToggle);

function initJsToggle() {
    $$(".js-toggle").forEach((button) => {
        const target = button.getAttribute("toggle-target");
        if (!target) {
            document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
        }
        button.onclick = (e) => {
            e.preventDefault();
            if (!$(target)) {
                return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $(target).classList.contains("hide");

            requestAnimationFrame(() => {
                $(target).classList.toggle("hide", !isHidden);
                $(target).classList.toggle("show", isHidden);
            });
        };
        document.onclick = function (e) {
            if (!e.target.closest(target)) {
                const isHidden = $(target).classList.contains("hide");
                if (!isHidden) {
                    button.click();
                }
            }
        };
    });
}

window.addEventListener("template-loaded", () => {
    const links = $$(".js-dropdown-list > li > a");

    links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest("li");
            item.classList.toggle("navbar-item-active");
        };
    });
});


window.addEventListener("template-loaded", () => {
    const tabsSelector = "prod-tab__item";
    const contentsSelector = "prod-tab__content";

    const tabActive = `${tabsSelector}--current`;
    const contentActive = `${contentsSelector}--current`;

    const tabContainers = $$(".js-tabs");
    tabContainers.forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
        const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
        tabs.forEach((tab, index) => {
            tab.onclick = () => {
                tabContainer.querySelector(`.${tabActive}`)?.classList.remove(tabActive);
                tabContainer.querySelector(`.${contentActive}`)?.classList.remove(contentActive);
                tab.classList.add(tabActive);
                contents[index].classList.add(contentActive);
            };
        });
    });
});


function changeImage(id) {
    // ./asset/img/products-previews/xh2s/item-1.jpg
    // Đặt đường dẫn ảnh lớn dựa trên ID
    const link = `./asset/img/${id}.jpg`;
    const bigImage = document.getElementById("show-img");
    bigImage.src = link;

    // Lấy tất cả các hình ảnh nhỏ
    const thumbnails = document.querySelectorAll("[id^='chuot22-']");
    
    // Xóa lớp "selected" khỏi tất cả hình ảnh nhỏ
    thumbnails.forEach(thumbnail => thumbnail.classList.remove("selected"));

    // Thêm lớp "selected" vào hình ảnh được chọn
    const selectedThumbnail = document.getElementById(id);
    if (selectedThumbnail) {
        selectedThumbnail.classList.add("selected");
    }
}


// ======================== SlideShow
document.addEventListener('DOMContentLoaded', () => {
    const listImage = document.querySelector('.slideshow__inner');
    const imgs = document.querySelectorAll('.slideshow__item');
    const btnPrev = document.querySelector('.slideshow__nav-btn--prev');
    const btnNext = document.querySelector('.slideshow__nav-btn--next');

    let currentIndex = 0;
    const totalSlides = imgs.length;
    let isChanging = false; 

    const updateSlidePosition = () => {
        const width = imgs[0].offsetWidth;
        listImage.style.transform = `translateX(${-currentIndex * width}px)`;
    };

    const nextSlide = () => {
        if (isChanging) return; 
        isChanging = true;
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlidePosition();
        setTimeout(() => isChanging = false, 500); 
    };

    const prevSlide = () => {
        if (isChanging) return;
        isChanging = true;
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlidePosition();
        setTimeout(() => isChanging = false, 500);
    };

    btnNext.addEventListener('click', nextSlide);
    btnPrev.addEventListener('click', prevSlide);

    
    setInterval(nextSlide, 8000);
});


document.addEventListener('DOMContentLoaded', () => {
    const thumbs = document.querySelectorAll('.product-preview__thumbs-img');
    const mainImage = document.querySelector('.product-preview__list .product-preview__img');

    const changeImage = (index) => {
        const newSrc = thumbs[index].src;
        mainImage.src = newSrc;

        thumbs.forEach((thumb, i) => {
            thumb.classList.remove('product-preview__thumbs-img--curent');
            if (i === index) {
                thumb.classList.add('product-preview__thumbs-img--curent');
            }
        });
    };

    // Gắn sự kiện click cho các hình thu nhỏ
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            changeImage(index);
        });
    });
});



// ---------------login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const username = usernameField.value.trim();
        const password = passwordField.value.trim();

        if (!username || !password) {
            alert('Vui lòng điền vào cả hai trường');
            return;
        }

        if (username === 'admin' && password === '123') {
            alert('Đăng nhập thành công');
            window.location.href = 'index.html';
        } else {
            alert('Sai thông tin username hoặc password');
        }

        usernameField.value = '';
        passwordField.value = '';
    });
});










