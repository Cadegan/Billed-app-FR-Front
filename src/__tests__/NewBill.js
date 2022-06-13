/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
// import Bills from "../containers/Bills.js";
// import { bills } from "../fixtures/bills.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
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

    //handleChangeFile
    // Contrôle lors de l'upload et message d'erreur en cas de mauvais format
    test("Then the file is uploaded with good extension", async () => {
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
        });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      const file = new File(["goodFile.jpg"], "goodFile.jpg", {
        type: "image/jpg",
      });
      const allowedExtension = /(\.jpg|\.jpeg|\.png)$/i;

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);

      userEvent.upload(input, file);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toBe("goodFile.jpg");
      expect(input.files[0].name).toMatch(allowedExtension);
    });

    test("Then the file is uploaded with wrong extension", async () => {
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
        });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      const file = new File(["badFile.pdf"], "badFile.pdf", {
        type: "application/pdf",
      });
      const allowedExtension = /(\.jpg|\.jpeg|\.png)$/i;

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);

      userEvent.upload(input, file);
      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toBe("badFile.pdf");
      expect(input.files[0].name).not.toMatch(allowedExtension);
    });

    //handleSubmit : Affichage de la nouvelle note de frais
    test("Then the sending of a NewBill is validated, the bill should be displayed", async () => {
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
        });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const btnSendBill = screen.getByTestId("form-new-bill");

      btnSendBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(btnSendBill);
      // userEvent.click(btnSendBill);

      expect(handleSubmit).toHaveBeenCalled();
      // expect(screen.getByTestId())
    });
  });
});

//Test d'erreur
describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
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

  test("fetches messages from an API and fails with 500 message error", async () => {
    jest.spyOn(mockStore, "bills");
    console.error = jest.fn();

   window.onNavigate(ROUTES_PATH.NewBill);

    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    await new Promise(process.nextTick);
    // const message = await screen.getByText(/Erreur 500/);
    // expect(message).toBeTruthy();

    const newBill = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: localStorageMock,
    });

    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const btnSendBill = screen.getByTestId("form-new-bill");

      btnSendBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(btnSendBill);
      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
  });
});
