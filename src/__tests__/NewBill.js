/* eslint-disable no-undef */
/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom/extend-expect";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = "<div id=\"root\"></div>";
      router();
    });

    test("Then mail icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.className).toContain("active-icon");
    });

    test("Then it should render the NewBill Page", () => {
      const NewBillPage = screen.getByText("Envoyer une note de frais");
      expect(NewBillPage).toBeVisible();

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeVisible();
    });

    //handleChangeFile
    // Contrôle lors de l'upload et le format du fichier
    test("Then the file is uploaded with good extension", async () => {

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);
      fireEvent.change(input, {
        target: {
          files: [
            new File(["goodFile.jpg"], "goodFile.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });

      const allowedExtension = /(\.jpg|\.jpeg|\.png)$/i;

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toBe("goodFile.jpg");
      expect(input.files[0].name).toMatch(allowedExtension);
    });

    test("Then the file is uploaded with wrong extension", async () => {
       const newBill = new NewBill({
         document,
         onNavigate,
         store: mockStore,
         localStorage: localStorageMock,
       });

       const handleChangeFile = jest.fn(newBill.handleChangeFile);
       const input = screen.getByTestId("file");
       input.addEventListener("change", handleChangeFile);
       fireEvent.change(input, {
         target: {
           files: [
             new File(["badFile.pdf"], "badFile.pdf", {
               type: "application/pdf",
             }),
           ],
         },
       });

       const allowedExtension = /(\.jpg|\.jpeg|\.png)$/i;

       expect(handleChangeFile).toHaveBeenCalled();
       expect(input.files[0].name).toBe("badFile.pdf");
       expect(input.files[0].name).not.toMatch(allowedExtension);
    });

    //  test("Then the sending of a NewBill is validated, the new bill should be created in API", async () => {

    //   jest.spyOn(mockStore, "bills");
    //   const billsList = await mockStore.bills().list();

    //   expect(billsList.length).toBe(4);

    //   let bill = {
    //     email: "employee@tld.com",
    //     type: "Transports",
    //     name: "Bill test",
    //     amount: "200",
    //     date: "2022-06-14",
    //     vat: "50",
    //     pct: "20",
    //     commentary: "Moked test",
    //     fileUrl: "https://localhost:3456/images/test.jpg",
    //     fileName: "test.jpg",
    //     status: "pending",
    //   };

    //   mockStore.bills().create(bill);
    //   await waitFor(() => expect(billsList.length).toBe(5));
    //  });

    test("Then the sending of a NewBill is validated, the new bill should be updated in API", async () => {
      const billCreated = mockStore.bills().update();
      const createBill = await billCreated.then((value) => {
        return value;
      });

      expect(createBill.id).toBe("47qAXb6fIm2zOKkLzMro");
      expect(createBill.fileUrl).toBe(
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
      );
      expect(createBill.fileName).toBe("preview-facture-free-201801-pdf-1.jpg");
      expect(createBill.key).toBeUndefined;
    });

    test("Then the sending of a NewBill is validated, the new bill should be created in API", async () => {
      const billUpdated = mockStore.bills().create();
      const updateBill = await billUpdated.then((value) => {
        return value;
      });

      expect(updateBill.id).toBeUndefined;
      expect(updateBill.fileUrl).toBe("https://localhost:3456/images/test.jpg");
      expect(updateBill.fileName).toBeUndefined;
      expect(updateBill.key).toBe("1234");
    });

    //handleSubmit : Affichage de la nouvelle note de frais
    test("Then the sending of a NewBill is validated, the new bill should be displayed", async () => {

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
      expect(screen.getByTestId("btn-new-bill")).toBeVisible();
      expect(screen.getByText("Mes notes de frais")).toBeVisible();
    });
  });
});

//Test d'erreur
describe("When an error occurs on API", () => {
  test("fetches messages from an API and fails with 500 message error", async () => {
    jest.spyOn(mockStore, "bills");
    console.error = jest.fn();

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

    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: localStorageMock,
    });

    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
    const btnSubmitBill = screen.getByTestId("form-new-bill");

    btnSubmitBill.addEventListener("submit", handleSubmit);
    fireEvent.submit(btnSubmitBill);
    await new Promise(process.nextTick);
    expect(console.error).toBeCalled();
  });
});
