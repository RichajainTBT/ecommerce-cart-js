let productContainer = document.querySelector("#product-container");
let productDetailsContainer = document.querySelector("#product-detials-container");
let toastContainer = document.querySelector("#toast-container");
let cartRecord = document.querySelector("#cartRecord");
let productArray = [];
let categoryArray = [];

// get all category
function getAllCategory() {
    fetch("https://api.escuelajs.co/api/v1/categories/?&limit=5&offset=5")
        .then(res => {
            if (!res.status) throw new Error("Network error");
            return res.json();
        })
        .then(result => {
            categoryArray = result;
            updateCategoryData()
        })
        .catch(err => console.log(err))
}
//get all category

// get all product
async function fetchProductData(id) {
    try {
        let url = "https://api.escuelajs.co/api/v1/products";
        if (id) {
            url += `?categoryId=${id}`
        }
        let response = await fetch(url);
        if (!response.ok) throw new Error("Network error")
        let result = await response.json();
        return result;
    }
    catch (e) {
        console.log(e)
    }
}
//  get all product

//add category to DOM
async function updateCategoryData() {
    let categoryList = '';

    for (const category of categoryArray) {

        let productList = '';

        let productListArray = await fetchProductData(category.id);
        productListArray = productListArray.slice(0, 10);

        productListArray.forEach((product) => {
            productList += `
                     <div class="col-md-4">
                        <div class="card product-card mb-3">
                           <a href="product-details.html?productId=${product.id}">
                            <img src="https://placehold.co/600x400" class="w-100">
                            </a> 
                            <div class="card-body">
                             <a href="product-details.html?productId=${product.id}">
                                <h4>${product.title}</h4>
                              </a>  
                                <h5>${category.name}</h5>
                                <div class="row">
                                    <div class="col-6">
                                       $${product.price}
                                    </div>
                                    <div class="col-6 text-right">
                                        <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to cart</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
        });

        categoryList += `
                 <div class="product-section mb-4">
                <h4>${category.name}</h4>
                <hr>
                 <div class="row">
                  ${productList}
                 </div>
            </div>`
    }
    if (productContainer) {
        productContainer.innerHTML = categoryList;
    }

}
//add category to DOM

//get single product
async function getProduct(id) {
    try {
        let url = `https://api.escuelajs.co/api/v1/products/${id}`;
        let response = await fetch(url);
        console.log(response)
        if (!response.ok) throw new Error("Network error");
        let result = await response.json();
        return result;
    } catch (err) {
        console.log(err)
    }

}
//get single product

//set single product in dom
async function setProductData(product) {
    productDetailsContainer.innerHTML = `
     <div class="product-section mb-4">
                <h4>Product Name</h4>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <img src="https://placehold.co/600x400" class="w-100">
                    </div>
                    <div class="col-md-6">
                        <h4>${product.title}</h4>
                        <h5>${product.category.name}</h5>
                        <h6>Price : ${product.price}</h6>
                        <hr>
                        <p>${product.description}</p>
                        <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to cart</button>
                        <button class="btn btn-danger">Buy Now</button>
                    </div>
                </div>
            </div>
   `
}
//set single product in dom

// toast
function showToast(bgClass, msg) {
    toastContainer.style.display = "block";
    let toastEl = document.querySelector(".toast");
    let toast = new bootstrap.Toast(toastEl);
    toast.show()
    toastEl.classList.add(bgClass);
    let toastBody = toastEl.querySelector(".toast-body");
    toastBody.innerHTML = msg;

    setTimeout(() => {
        toastEl.classList.remove(bgClass);
        toastBody.innerHTML = ''
        toast.hide();
        toastContainer.style.display = "none";
    }, 3000)
}
// toast

// add to cart function
let cart = [];

async function addToCart(id) {
    let product = await getProduct(id);
    let existing = cart.find((item) => item.id == Number(id));

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    loadCartData();
    showToast("bg-success", "Product Added to cart");
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartData() {
    if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"));
        let cartItem = '';
        if (cart.length < 1) {
            cartItem = `<tr colspan="6"><td class='text-center'>No data found</td></tr>`
        } else {
            cart.forEach((item ,index) => {
                cartItem += `
                   <tr>
                            <td>${index+1}</td>
                                    <td>
                                        <div class="cart-product-details">
                                            <div class="cart-img-sec">
                                                <img src="https://placehold.co/600x400">
                                            </div>
                                            <div class="card-details">
                                                <h6>${item.title}</h6>
                                                <p>${item.category.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-sm btn-danger decrementCount" onclick="cartQuantityUpdate(${item.id} , 'sub')">-</button>
                                            <input class="form-control cart-quantity form-control-sm" value="${item.quantity}" style="width:100px" readonly>
                                            <button class="btn btn-sm btn-success incrementCount" onclick="cartQuantityUpdate(${item.id} , 'add')" >+</button>
                                        </div>
                                    </td>
                                    <td>$${item.price}</td>
                                    <td>$${item.price * item.quantity}</td>
                                    <td><button class="btn btn-danger btn-sm" onclick="deleteCartProduct(${item.id})">Delete</button></td>
                                </tr>
                `
            })
        }
        if (cartRecord) cartRecord.innerHTML = cartItem;
    } else {
        if (cartRecord) cartRecord.innerHTML = "<tr><td colspan='6' class='text-center'>No item in yor cart</td></tr>"
    }
    updateCartCalculation();
}
// update cart quantity
async function cartQuantityUpdate(id, action) {
    let product = cart.find((item) => item.id === Number(id));
    if(!product) return;
    if (action == "add") {
        product.quantity++;
    } else if (action == "sub") {
        if (product.quantity > 1) {
            product.quantity--;
        } else if (product.quantity == 1) {
            if (confirm("Do you want to delete this product from cart")) {
                deleteCartProduct(id);
                return;
            }
           
        }
    }
    saveCart();
    loadCartData();
    showToast("bg-success", "Product Updated to cart")
}
// update cart quantity

//delete cart
 async function deleteCartProduct(id){
  let product = cart.find((item) => item.id === Number(id));
  if(!product) return;
  cart = cart.filter((val)=>val.id !== Number(id))
  saveCart();
  loadCartData();
  showToast("bg-danger", "Product removed from cart");
 }
//delete cart

function updateCartCalculation() {
    let totalCartAmt = 0;
    totalCartAmt = cart.reduce((val, currentItem) => {
        let total = currentItem.price * currentItem.quantity;
        return val + total;
    }, 0)
    let cartTotal = document.querySelector("#cartTotal");
    if (cartTotal) cartTotal.textContent = totalCartAmt;

    let totalCartItem = document.querySelectorAll(".totalItem");
    totalCartItem.forEach((cartitem) => {
        cartitem.textContent = cart.reduce((acc, val) => {
            return acc + val.quantity;
        }, 0)
    })
}

document.addEventListener("DOMContentLoaded", async (e) => {
    getAllCategory();
    loadCartData();
    let parma = new URLSearchParams(window.location.search);
    let productId = parma.get("productId");
    if (productId) {
        let productData = await getProduct(productId);
        setProductData(productData)
    }
})