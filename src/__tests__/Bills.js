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

import router from "../app/Router.js";

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
      test("A modal should open", async () => {
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
          document.body.innerHTML = ROUTES({ pathname }); //Recupère l'url de l'employé
        };

        document.body.innerHTML = BillsUI({ data: bills });

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

//getBills(Date's format?)
