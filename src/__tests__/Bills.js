/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.className).toContain("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  //Test buttonNewBill
  describe("When I'm employee, on Bills Page and click on the new bill button", () => {
    test("A new form bill container open", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee", //Déclare l'user comme employé dans le "localStorage"
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname }); //Recupère l'url de l'employé
      };
      const newBill = new Bills({
        document,
        onNavigate,
      });
      const handleClickNewBill = jest.fn(
        () =>
          //jest.fn crée directement une fonction mock
          newBill.handleClickNewBill
      );
      const button = screen.getByTestId("btn-new-bill");
      button.addEventListener("click", handleClickNewBill);
      userEvent.click(button); //Simule le click de l'utilisateur et lance la fonction handleClickNewBill
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")); //Contrôle si la nouvelle note de frais est affichée
    });
  });

  //handleClickIconEye
  describe("Given I am connected as Employee and I am on Dashboard page and I clicked on a bill", () => {
    describe("When I click on the icon eye", () => {
      test("Then a modal should open", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({
            pathname,
          }); //Recupère l'url de l'employé
        };

        document.body.innerHTML = BillsUI({
          data: bills,
        }); //Recupère la façon d'afficher les notes de frais

        const _bills = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: localStorageMock,
        });

        $.fn.modal = jest.fn();
        const eye = screen.getAllByTestId("icon-eye")[0];
        const handleClickIconEye = jest.fn(_bills.handleClickIconEye(eye));
        eye.addEventListener("click", handleClickIconEye);
        userEvent.click(eye);
        expect(handleClickIconEye).toHaveBeenCalled();

        const imageProof = document.querySelector(".bill-proof-container img");
        expect(eye.getAttribute("data-bill-url")).toEqual(
          imageProof.getAttribute("src")
        );
      });
    });
  });
});

//getBills
describe("Given I am connected", () => {
  describe("When I am on the Bills page", () => {
    test("Then I get no bills", () => {
      const bills = new Bills({
        store: null,
        document,
      });
      expect(bills.getBills()).toBe(undefined);
    });
    test("Then I get bills", async () => {
      const bills = new Bills({
        store: mockStore,
        document,
      });
      const billsCollected = await bills.getBills();
      expect(billsCollected.length).toBe(4);
    });
  });
});

// test("Then, all bills should be showed", async () => {
//   Object.defineProperty(window, "localStorage", {
//           value: localStorageMock,
//         });
//         window.localStorage.setItem(
//           "user",
//           JSON.stringify({
//             type: "Employee",
//           })
//         );

//   const getSpy = jest.spyOn(mockStore, "bills");
//   const bills = await mockStore.bills();
//   expect(getSpy).toHaveBeenCalledTimes(1);
//   expect(bills.data.length).toBe(4);

// });

//Test d'intégration
describe("Given I am connected as Employee", () => {
  describe("When I am on the Bills page", () => {
    test("Then, all bills should be showed", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
    });
  });

  describe("When an error append", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "test@error",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
    });

    test("Then call 404 message error simulation", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("Then call 500 message error simulation", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});

// describe("Test error", () => {
//   test("Test description", async () => {
//     jest.spyOn(date, "doc").mockImplementation(async () => {
//       throw new Error("Corrupted data");
//     });
//     await expect(bills()).rejects.toThrowError();
//     fs.doc.mockStore();
//   });
// });
