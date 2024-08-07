import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { createStore } from "@reduxjs/toolkit";
import { rootReducer } from "@/app/store";
import ResourcesPage from "./page";
import { showLoader, hideLoader } from "@/lib/features/loader/loaderSlice";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";

jest.mock("@/app/services/fetchData");
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

const store = createStore(rootReducer);

describe("ResourcesPage", () => {
  it("displays an error message when the API request fails", async () => {
    fetchData.mockRejectedValue(new Error("API request failed"));

    render(
      <Provider store={store}>
        <ResourcesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(store.getState().loader.isLoading).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Error fetching resources, Please try again"
      );
    });
  });
});
