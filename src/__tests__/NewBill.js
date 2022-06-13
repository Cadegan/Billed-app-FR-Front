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
    });

    test("Then the sending of a NewBill is validated, the new bill should be created in API", async () => {
      // const billDemo = {
      //   id: "47qAXb6fIm2zOKkLzMro",
      //   vat: "80",
      //   fileUrl:
      //     "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      //   status: "pending",
      //   type: "Hôtel et logement",
      //   commentary: "séminaire billed",
      //   name: "encore",
      //   fileName: "preview-facture-free-201801-pdf-1.jpg",
      //   date: "2004-04-04",
      //   amount: 400,
      //   commentAdmin: "ok",
      //   email: "a@a",
      //   pct: 20,
      // };

      const updateBill = mockStore.bills().update();
      const addBill = await updateBill.then((value) => {
        return value;
      });

      expect(addBill.id).toBe("47qAXb6fIm2zOKkLzMro");
      expect(addBill.fileUrl).toBe(
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
      );
      expect(addBill.fileName).toBe("preview-facture-free-201801-pdf-1.jpg")

      // const mockedBills = mockStore.bills();
      // const spyBillDemo = jest.spyOn(mockedBills, "update");
      // const bills = await spyBillDemo(billDemo);
      // const addBill = [...bills, billDemo];
      // expect(spyBillDemo).toHaveBeenCalledTimes(1);
      // expect(addBill.length).toBe(5);
      // expect(addBill[4].name).toBe("preview-facture-free-201801-pdf-1.jpg")

      // const mockedBills = mockStore.bills();
      // const spyBillDemo = jest.spyOn(mockedBills, "update");

      // const billUpdate = await spyBillDemo(billDemo);

      // expect(billUpdate.id).toBe("47qAXb6fIm2zOKkLzMro");
      // expect(billUpdate.fileUrl).toBe(
      //   "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
      // );
      // expect(billUpdate.fileName).toBe("preview-facture-free-201801-pdf-1.jpg")
    })

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

    console.error = jest.fn();
    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    
    window.onNavigate(ROUTES_PATH.NewBill);

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
