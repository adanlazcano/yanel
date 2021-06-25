OpenPay.setId('XXXXXX');
OpenPay.setApiKey('XXXXXXX');
OpenPay.setSandboxMode(true);
const header = document.querySelector('.l-header');
const toggle = document.getElementById('nav-toggle');
const nav = document.getElementById('nav-menu');
const navLink = document.querySelectorAll('.nav__link');
const navCart = document.getElementById('nav-cart');
const navMenuCart = document.getElementById('nav-menu-cart');
const navMenuContentCart = document.getElementById('nav-menu-cart-content');
const footerMenuCartContent = document.getElementById('footer-menu-cart-content');
const templateCart = document.getElementById('template-cart').content;
const itemsFeatured = document.getElementById('items-featured');
const templateFeatured = document.getElementById('template-items-featured').content;
const itemsNew = document.getElementById('items-new');
const templateNew = document.getElementById('template-items-new').content;
const fragment = document.createDocumentFragment();
const fragmentNew = document.createDocumentFragment();
const gallery = document.getElementById('gallery');
const templateGallery = document.getElementById('template-gallery').content;
const templateConfirmBuy = document.getElementById('template-confirm-buy').content;
let cart = {};
let galleryObject = {};
let mainObject = {};
let tokenCharge = "";

// DOM functionality

const showMenu = () => {
    if (toggle && nav) {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            nav.classList.toggle('show');
            navMenuCart.classList.remove('show');
        });
    }
}
showMenu();

function linkAction() {

    navLink.forEach(element => element.classList.remove('active'));
    this.classList.add('active');
    nav.classList.remove('show');
    gallery.classList.remove('pop-up');
}

navLink.forEach(element => element.addEventListener('click', linkAction));

navCart.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    nav.classList.remove('show');
    navMenuCart.classList.toggle('show');

});

document.addEventListener('click', (e) => {

    navMenuCart.classList.remove('show');
    nav.classList.remove('show');

});

// End DOM functionaly

// Fetch to PHP file (showProducts)
const fetchData = async() => {
    try {
        const res = await fetch('./public/php/products.php');
        const data = await res.json();
        drawData(data);
    } catch (error) {
        console.log(error);
    }
}


const drawDataForState = (template, item) => {

    template.querySelector('img').setAttribute('src', item.thumbnailUrl);
    template.querySelector('.img-gallery').dataset.id = item.idProduct;
    template.querySelector('img').dataset.src = item.thumbnailUrl;
    template.querySelector('.featured__name').textContent = item.name;
    template.querySelector('.description-featured').textContent = item.description;
    template.querySelector('.dimension-featured').textContent = ``;
    template.querySelector('.featured__price').textContent = `$${item.price}`;
    template.querySelector('.button-btn').dataset.id = item.idProduct;

    return template;

}


// Draw Products by State from the BD through file PHP
const drawData = data => {

    data.forEach(item => {

        galleryObject[item.idProduct] = {
            name: item.name,
            description: item.description,
            large: item.large,
            height: item.height,
            width: item.width,
            price: item.price,
            gallery: item.gallery,
            thumbnailUrl: item.thumbnailUrl
        };

        if (item.state === 'featured') {

            const featured = drawDataForState(templateFeatured, item);
            const clone = featured.cloneNode(true);
            fragment.appendChild(clone);

        } else if (item.state === 'new') {

            const news = drawDataForState(templateNew, item);
            const clone = news.cloneNode(true);
            fragmentNew.appendChild(clone);
        }
    });

    itemsFeatured.appendChild(fragment);
    itemsNew.appendChild(fragmentNew);
}

// Message after buy products and return initial state (clear local Storage)
const chargeSuccess = () => {

        cart = {};

        drawCart();

        gallery.innerHTML = '';

        gallery.classList.add('pop-up');

        gallery.innerHTML = '<img class="close" src="./public/img/close.png" alt="close">';

        const contentCharge = document.createElement('div');

        contentCharge.classList.add('content-charge');

        contentCharge.innerHTML = `<i class='bx bxs-comment-check'></i> 
    <span>¡¡Cargo Exitoso!!</span> 
    <p>¡Gracias por comprar en Yanel!</p>`;

        gallery.appendChild(contentCharge);

        gallery.querySelectorAll('.close').forEach(item => item.addEventListener('click', () => {

            gallery.classList.remove('pop-up');
            gallery.innerHTML = '';
            header.classList.remove('hidden');
            localStorage.clear();
            window.location.reload();
        }));


    }
    // Save Products and wire transfer on the BD
const drawConfirmBuy = () => {

    gallery.innerHTML = '';
    let listItem = '';
    templateConfirmBuy.querySelector('.list-resume-buy').innerHTML = '';

    Object.values(cart).forEach(item => {
        listItem = `
        <li>${item.unit}&nbsp;
        ${item.name}
        <span>$ ${item.price * item.unit}</span></li>`;

        templateConfirmBuy.querySelector('.list-resume-buy').innerHTML += listItem;
    });
    const mapObject = Object.values(cart).map(item => {
        let product = {
            idProduct: item.idProduct,
            unit: item.unit,
            price: item.price * item.unit
        }
        return product;
    })
    mainObject.product = mapObject;

    templateConfirmBuy.querySelector('.total-resume').innerHTML = document.querySelector('.total-cart').textContent;

    mainObject.total = document.querySelector('.total-cart').textContent.slice(9);

    const clone = templateConfirmBuy.cloneNode(true);
    fragment.appendChild(clone);
    gallery.appendChild(fragment);


    gallery.querySelectorAll('.close').forEach(item => item.addEventListener('click', () => {

        gallery.classList.remove('pop-up');

    }));

    const formPay = gallery.querySelector('#payment-form');
    //     //Se genera el id de dispositivo
    let deviceSessionId = OpenPay.deviceData.setup(formPay, "deviceIdHiddenFieldName");

    gallery.querySelector('#pay-button').addEventListener('click', function(e) {

        mainObject.customer = {
            name: gallery.querySelector('#holder_name').value,
            phone: gallery.querySelector('#phone').value,
            email: gallery.querySelector('#email').value,
            card: gallery.querySelector('#card_number').value
        }

        mainObject.deviceSessionId = deviceSessionId

        e.preventDefault();
        e.target.disabled = true;
        OpenPay.token.extractFormAndCreate(formPay, sucess_callbak, error_callbak);

    });

    const sucess_callbak = function(response) {

        var token_id = response.data.id;
        gallery.querySelector('#token_id').value = token_id;

        mainObject.tokenId = token_id;

        header.classList.add('hidden');

        gallery.querySelector('.loader').classList.add('active');

        fetch('./public/php/save.php', {
            method: 'POST',
            body: JSON.stringify(mainObject)
        }).then(response => {

            console.log(response);

            gallery.querySelector('.loader').classList.remove('active');
            chargeSuccess();

        });

    };

    const error_callbak = function(response) {
        let desc = response.data.description != undefined ? response.data.description : response.message;
        alert("ERROR [" + response.status + "] " + desc);
        gallery.querySelector('#pay-button').disabled = true;
    };
}


// Draw Cart and set on Local Storage
const drawCart = () => {

    navMenuContentCart.innerHTML = '';
    footerMenuCartContent.innerHTML = '';

    if (Object.keys(cart).length === 0) {

        gallery.classList.remove('pop-up');

        navCart.classList.remove('counter');

        navMenuContentCart.innerHTML = `<div class="content-empty-cart">
        <i class="bx bx-cart-alt" style="font-size:40px;"></i>
        <p>Carrito vacio</p>
        <br>
        <a href="#featured" id="start-buy" style="text-transform:uppercase;letter-spacing:2px;">Comienza a comprar</a>
    </div>`;

        navMenuContentCart.querySelector('#start-buy').addEventListener('click', (e) => {

            e.stopPropagation();
            navMenuCart.classList.remove('show');
            gallery.classList.remove('pop-up');
        });

    } else {

        navCart.classList.add('counter');
        navCart.innerHTML = `<style>
        .nav__cart.counter::after {
            content: '${count}';
            position: absolute;
            
            justify-content:center;
            display:flex;
            align-items:center;
            right: 4px;
            font-size: 0.6rem;
            font-weight:500;
            padding:8px;
            font-family: var(--body-font);
            background-color: var(--first-color);
            border-radius: 50%;
            width:20px;
            height:20px;
            animation: bounce 1s ease-in-out infinite; 
            
        }
        
        @keyframes bounce {
            0% { top: -10px;}
            50% {top: -5px; }
            55% {top: -2px; }
            65% {top: 0px;}
            95% {top: -5px;}		
            100% {top: -10px;}
        }
        
        </style>`;


        Object.values(cart).forEach(item => {
            templateCart.querySelector('.unit-cart').textContent = item.unit + ' unidad(es)';
            templateCart.querySelector('.img-cart').setAttribute('src', item.img);
            templateCart.querySelector('.name-cart').textContent = item.name;
            templateCart.querySelector('.dimension-cart').textContent = item.dimension;
            templateCart.querySelector('.price-cart').textContent = `$` + parseInt(item.unit) * parseFloat(item.price);
            templateCart.querySelector('.btn-add').dataset.id = item.idProduct;
            templateCart.querySelector('.btn-sub').dataset.id = item.idProduct;

            const clone = templateCart.cloneNode(true);
            fragment.appendChild(clone);
        });

        const sumUnit = Object.values(cart).reduce((acc, { unit }) => acc + unit, 0);
        const sumTotal = Object.values(cart).reduce((acc, value) => acc + parseInt(value.unit) * parseFloat(value.price), 0);

        footerMenuCartContent.innerHTML = `
        <a id="empty" style="color:white;font-size:9px;" href="#" class="button button-footer">Vaciar Todo</a>
        <ul>
        <li class="total-unit">${sumUnit} unidad(es)</li>
        <li class="total-cart">Total : $${sumTotal}</li>
        <li><button id="btn-shop" style="font-size:9px;width:100%;" class="button button-footer">Comprar</button></li>
        </ul>`;

        footerMenuCartContent.querySelector('#empty').addEventListener('click', (e) => {
            e.stopPropagation();
            cart = {};
            footerMenuCartContent.innerHTML = '';

            drawCart();
        });



        footerMenuCartContent.querySelector('#btn-shop').addEventListener('click', e => {

            e.stopPropagation();
            gallery.classList.add('pop-up');

            navMenuCart.classList.remove('show');


            drawConfirmBuy();
        });

        navMenuContentCart.appendChild(fragment);


    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

const setCart = object => {
    const product = {
        idProduct: object.querySelector('.button-btn').dataset.id,
        img: object.querySelector('.img-object').dataset.src,
        unit: 1,
        name: object.querySelector('.name-object').textContent,
        dimension: object.querySelector('.dimension-object').textContent,
        price: object.querySelector('.price-object').textContent.slice(1)
    }

    if (cart.hasOwnProperty(product.idProduct)) {
        product.unit = cart[product.idProduct].unit + 1;
    }

    cart[product.idProduct] = {...product };

    drawCart();

    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cart buttons functionality
const btnAction = e => {

    if (e.target.classList.contains('btn-add') || e.target.classList.contains('btn-sub')) {
        e.stopPropagation();
        gallery.classList.remove('pop-up');

    }

    switch (e.target.classList['value']) {

        case 'btn-add':
            const add = cart[e.target.dataset.id];
            add.unit++;
            cart[e.target.dataset.id] = {...add };

            break;

        case 'btn-sub':
            const subs = cart[e.target.dataset.id];
            subs.unit--;
            cart[e.target.dataset.id] = {...subs };
            if (subs.unit === 0) {

                delete cart[e.target.dataset.id];

            }

            if (Object.keys(cart).length === 0) {

                footerMenuCartContent.innerHTML = '';
            }


            break;
    }

    drawCart();
    e.stopPropagation();
}

// Draw Gallery from template

const drawGallery = e => {


    gallery.innerHTML = '';
    let imgGalery = '';

    templateGallery.querySelector('.img-content').innerHTML = '';

    for (img of galleryObject[e.target.dataset.id].gallery) {
        imgGalery = document.createElement('img');
        imgGalery.classList.add('img-object');
        imgGalery.setAttribute('src', img);
        imgGalery.dataset.src = galleryObject[e.target.dataset.id].thumbnailUrl;
        templateGallery.querySelector('.img-content').appendChild(imgGalery);
    }
    templateGallery.querySelector('.name-gallery').textContent = galleryObject[e.target.dataset.id].name;

    templateGallery.querySelector('.desc-gallery').textContent = galleryObject[e.target.dataset.id].description;

    templateGallery.querySelector('.large-gallery').textContent = `Largo: ${galleryObject[e.target.dataset.id].large}`;

    templateGallery.querySelector('.height-gallery').textContent = `Alto: ${galleryObject[e.target.dataset.id].height}`;
    templateGallery.querySelector('.width-gallery').textContent = `Ancho: ${galleryObject[e.target.dataset.id].width}`;

    templateGallery.querySelector('.price-gallery').textContent = `$ ${galleryObject[e.target.dataset.id].price}`;

    const clone = templateGallery.cloneNode(true);
    fragment.appendChild(clone);

    gallery.appendChild(fragment);

    gallery.querySelectorAll('.close').forEach(item => item.addEventListener('click', () => {

        gallery.classList.remove('pop-up');
    }));
}

const catchEventBtn = e => {

    if (e.target.classList.contains('button-btn')) {

        const object = e.target.parentNode.parentNode;

        setCart(object);
    }

    if (e.target.classList.contains('img-gallery')) {
        gallery.classList.toggle('pop-up');

        drawGallery(e);

    }
    e.stopPropagation();
}

navMenuCart.addEventListener('click', btnAction);
document.addEventListener('click', catchEventBtn);



document.addEventListener('DOMContentLoaded', () => {

    fetchData();
    if (localStorage.getItem('cart')) {
        cart = JSON.parse(localStorage.getItem('cart'));
        drawCart();

    }
});
