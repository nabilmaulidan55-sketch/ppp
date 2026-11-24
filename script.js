const currentUser = localStorage.getItem("currentUser");
let transactions = JSON.parse(localStorage.getItem("transactions_"+currentUser)) || [];

const form=document.getElementById("form");
const list=document.getElementById("transaction-list");
const balance=document.getElementById("balance");
const totalIncome=document.getElementById("totalIncome");
const totalExpense=document.getElementById("totalExpense");
const resetBtn=document.getElementById("reset");
const toggleMode=document.getElementById("toggleMode");
const filter=document.getElementById("filter");

let chart;

function saveData(){
localStorage.setItem("transactions_"+currentUser,JSON.stringify(transactions));
}

function calculate(){
let income=0,expense=0;
transactions.forEach(t=>{
if(t.type==="income") income+=t.amount;
else expense+=t.amount;
});

totalIncome.innerText="Rp "+income.toLocaleString("id-ID");
totalExpense.innerText="Rp "+expense.toLocaleString("id-ID");
let saldo=income-expense;
balance.innerText="Rp "+saldo.toLocaleString("id-ID");

updateChart(income,expense);
updateTarget(saldo);
}

function render(){
list.innerHTML="";
let filtered=transactions;
if(filter.value!=="all"){
filtered=transactions.filter(t=>t.type===filter.value);
}
filtered.forEach((t,index)=>{
const li=document.createElement("li");
li.innerHTML=`${t.description} - Rp ${t.amount.toLocaleString("id-ID")}
<button onclick="deleteTransaction(${index})">X</button>`;
list.appendChild(li);
});
calculate();
}

function deleteTransaction(index){
transactions.splice(index,1);
saveData();
render();
}

form.addEventListener("submit",e=>{
e.preventDefault();
const desc=document.getElementById("description").value;
const amount=parseInt(document.getElementById("amount").value);
const type=document.getElementById("type").value;
transactions.push({description:desc,amount,type});
saveData();
render();
form.reset();
});

resetBtn.addEventListener("click",()=>{
transactions=[];
saveData();
render();
});

toggleMode.addEventListener("click",()=>{
document.body.classList.toggle("dark");
localStorage.setItem("mode",document.body.classList.contains("dark"));
});

if(localStorage.getItem("mode")==="true"){
document.body.classList.add("dark");
}

filter.addEventListener("change",render);

function logout(){
localStorage.removeItem("currentUser");
window.location.href="login.html";
}

function updateChart(income,expense){
const ctx=document.getElementById("financeChart");
if(chart) chart.destroy();
chart=new Chart(ctx,{
type:"doughnut",
data:{
labels:["Pemasukan","Pengeluaran"],
datasets:[{data:[income,expense]}]
}
});
}

function updateTarget(saldo){
const targetInput=document.getElementById("savingTarget");
const target=parseInt(localStorage.getItem("target_"+currentUser))||0;
targetInput.value=target;

if(target>0){
let percent=Math.min((saldo/target)*100,100);
document.getElementById("progressFill").style.width=percent+"%";
document.getElementById("savingProgress").innerText="Progress: "+percent.toFixed(1)+"%";
}
}

document.getElementById("savingTarget").addEventListener("change",function(){
localStorage.setItem("target_"+currentUser,this.value);
calculate();
});

async function exportPDF(){
const { jsPDF } = window.jspdf;
const doc=new jsPDF();
doc.text("Laporan Keuangan - "+currentUser,10,10);
let y=20;
transactions.forEach(t=>{
doc.text(`${t.description} - Rp ${t.amount}`,10,y);
y+=10;
});
doc.save("laporan_keuangan.pdf");
}

render();