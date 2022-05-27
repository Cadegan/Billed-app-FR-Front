import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";

import Actions from "./Actions.js";

const row = (bill) => {
  return `
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${
        bill.hasOwnProperty("formatDate") ? bill.formatDate : bill.date
      }</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `;
};

const isDateValidated = (bill) => (bill.date === null ? false : true);

const antiChrono = (a, b) => {
  const aDate = a.hasOwnProperty("formatIso") ? a.formatIso : a.date;
  const bDate = b.hasOwnProperty("formatIso") ? b.formatIso : b.date;

  return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
};

// const antiChrono = (a, b) => ((a < b) ? 1 : -1)

// const antiChroneVtwo = arr.sort((a, b) => a.date - b.date);
// const antiChroneVthree = (a, b) => ((a.date < b.date) ? 1 : -1)

// const datesSorted = [...bills].sort(antiChrono)

// const arr = [...bills]
// const sortByDate = arr => {
//   const sorter = (a, b) => {
//     return new Date(a.date).getTime() - new Date(b.date).getTime();
//   }
//   arr.sort(sorter);
// };

const rows = (data) => {
  // return data && data.length ? data.map((bill) => row(bill)).join("") : "";

  if (data && data.length) {
    const billsAntiChronoSorted = data.filter(isDateValidated).sort(antiChrono);
    return billsAntiChronoSorted.map((bill) => row(bill)).join("");
  } else {
    return "";
  }

  //Formater les dates en "ISO8601" (?)
  //Si données corrompues, les filtrer
  // : Est-ce necessaire? getBills() formate par defaut les dates au cas ou?
  //Trier les dates
  //const sortByDate = data.sort(antiChrono)
  //return sortByDate.map((bill) => row(bill)).join("")

  // return data && data.length ? data.map((bill) => row(bill)).join("") : "";
};

export default ({ data: bills, loading, error }) => {
  const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

  if (loading) {
    return LoadingPage();
  } else if (error) {
    return ErrorPage(error);
  }

  console.log("rows", rows(bills));

  return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
