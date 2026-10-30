import Swal from "sweetalert2";

export const showAlert = ({
  title = "Notification",
  text = "",
  icon = "info",
  confirmButtonText = "OK",
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    confirmButtonColor: "#dc2626",
    background: "#ffffff",
    color: "#0f172a",
  });
};

export const confirmAction = async ({
  title = "Are you sure?",
  text = "Do you want to continue?",
  confirmButtonText = "Yes, continue",
  cancelButtonText = "Cancel",
  icon = "warning",
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
    focusCancel: true,
    background: "#ffffff",
    color: "#0f172a",
  });

  return result.isConfirmed;
};