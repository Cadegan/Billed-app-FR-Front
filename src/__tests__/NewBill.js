/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
/*import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";*/
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.className).toContain("active-icon");
    });
  });
});

//handleChangeFile : Contrôle lors de l'upload et message d'erreur en cas de mauvais format
// Describe("Given I am connected as an employee and upload a file", () => {});

//handleSubmit : Affichage de la nouvelle note de frais

//Test d'erreur
