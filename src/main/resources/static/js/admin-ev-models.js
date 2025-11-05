$(document).ready(function () {
  if (sessionStorage.getItem("isAdminLoggedIn") !== "true") {
    window.location.href = "/Evolve_Ev/index.html#admin";
    return;
  }
$("#backToAdminBtn").click(function () {
  window.location.href = "/Evolve_Ev/index.html#admin";
});


  loadEvModels();

  $("#logoutBtn").click(function () {
    if (confirm("Logout and return to login?")) {
      sessionStorage.removeItem("isAdminLoggedIn");
      // Optional: call backend logout only if implemented
      // $.post(`${BASE_URL}/logout`);
      window.location.href = "/Evolve_Ev/index.html#admin";
    }
  });

  $("#image").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => $("#imagePreview").attr("src", e.target.result).removeClass("d-none");
      reader.readAsDataURL(file);
    }
  });

  $("#addEvModelForm").on("submit", function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      e.stopPropagation();
      $(this).addClass("was-validated");
      return;
    }

    const isEdit = $("#modelId").val() !== "";
    const apiUrl = isEdit ? `${BASE_URL}/updateModel` : `${BASE_URL}/addModel`;

    $("#loader").removeClass("d-none");

    const formData = new FormData();
    if (isEdit) formData.append("id", $("#modelId").val());
    formData.append("modelName", $("#modelName").val());
    formData.append("company", $("#company").val());
    formData.append("price", $("#price").val());
    formData.append("rangeKm", $("#rangeKm").val());
    formData.append("topSpeed", $("#topSpeed").val());
    formData.append("description", $("#description").val());

    let features = $("#features").val().split(",").map(f => f.trim()).filter(f => f);
    formData.append("features", features.join(","));

    if ($("#image")[0].files.length > 0) {
      formData.append("image", $("#image")[0].files[0]);
    }

    $.ajax({
      url: apiUrl,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function () {
        $("#loader").addClass("d-none");
        showToast(isEdit ? "Model updated successfully!" : "Model added successfully!");
        resetForm();
        loadEvModels();
      },
      error: function () {
        $("#loader").addClass("d-none");
        showToast("Error saving model!", true);
      }
    });
  });

  function loadEvModels() {
    $.get(`${BASE_URL}/getAllModels`)
      .done(function (models) {
        let rows = "";
        models.forEach(m => {
          rows += `
            <tr>
              <td class="text-center"><img src="${m.imagePath ? BASE_URL + '/' + m.imagePath : '/images/no-image.png'}" width="80" class="rounded" /></td>
              <td>${escapeHtml(m.modelName)}</td>
              <td>${escapeHtml(m.company)}</td>
              <td>₹${m.price}</td>
              <td>${m.rangeKm} km</td>
              <td>${m.topSpeed} km/h</td>
              <td class="text-center">
                <button class="btn btn-sm btn-warning me-1" onclick="editModel(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteModel(${m.id})"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`;
        });
        if ($.fn.DataTable.isDataTable("#evModelTable")) {
          $("#evModelTable").DataTable().clear().destroy();
        }
        $("#evModelBody").html(rows);
        $("#evModelTable").DataTable({
          dom: "Bfrtip",
          buttons: ["copy", "csv", "excel", "pdf", "print"],
          pageLength: 8
        });
      })
      .fail(() => showToast("Failed to load models", true));
  }

  window.editModel = function (id) {
    $.get(`${BASE_URL}/getModel/${id}`)
      .done(function (m) {
        $("#modelId").val(m.id);
        $("#modelName").val(m.modelName);
        $("#company").val(m.company);
        $("#price").val(m.price);
        $("#rangeKm").val(m.rangeKm);
        $("#topSpeed").val(m.topSpeed);
        $("#description").val(m.description);
        $("#features").val(m.features ? m.features.join(", ") : "");
        $("#imagePreview").attr("src", m.imagePath ? BASE_URL + '/' + m.imagePath : "/images/no-image.png").removeClass("d-none");
        $("#submitBtn").text("Update Model").removeClass("btn-success").addClass("btn-primary");
        $("#cancelEditBtn").removeClass("d-none");
        $("html, body").animate({ scrollTop: $("#addEvModelForm").offset().top - 100 }, 400);
      })
      .fail(() => showToast("Failed to load model", true));
  };

  window.deleteModel = function (id) {
    if (!confirm("Are you sure you want to delete this model?")) return;
    $.ajax({
      url: `${BASE_URL}/deleteModel/${id}`,
      type: "DELETE",
      success: function () {
        showToast("Model deleted successfully!");
        loadEvModels();
      },
      error: function () {
        showToast("Error deleting model!", true);
      }
    });
  };

  $("#cancelEditBtn").click(resetForm);
  function resetForm() {
    $("#addEvModelForm")[0].reset();
    $("#modelId").val("");
    $("#imagePreview").addClass("d-none");
    $("#submitBtn").text("Add Model").removeClass("btn-primary").addClass("btn-success");
    $("#cancelEditBtn").addClass("d-none");
    $("#addEvModelForm").removeClass("was-validated");
  }

  function showToast(msg, isError = false) {
    const toast = $("#toastMsg");
    toast.removeClass("text-bg-success text-bg-danger").addClass(isError ? "text-bg-danger" : "text-bg-success");
    toast.find(".toast-body").text(msg);
    new bootstrap.Toast(toast[0]).show();
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
