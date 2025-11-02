// Only run once
if (!window.evModelsLoaded) {
  window.evModelsLoaded = true;

  let allModels = [];
  let filteredModels = [];
  let currentPage = 1;
  const modelsPerPage = 6;

  window.loadEvModelsPage = function () {
    const $list = $('#ev-model-list');

    $.get("getAllModels", function (evModels) {
      allModels = evModels;
      filteredModels = [...allModels];
      renderModels(getPageModels(filteredModels, currentPage), true);
      toggleLoadMoreButton();
    });

    $('#rangeFilter').off('change').on('change', function () {
      applyFilters(true);
    });

    $('#sortPrice').off('change').on('change', function () {
      applyFilters(true);
    });

    $('#loadMoreBtn').off('click').on('click', function () {
      currentPage++;
      renderModels(getPageModels(filteredModels, currentPage), false);
      toggleLoadMoreButton();
    });
    $('#searchInput').off('input').on('input', applyFilters);

  };

  function renderModels(models, reset = false) {
    const $list = $('#ev-model-list');
    if (reset) $list.empty();

    if (currentPage === 1 && models.length === 0) {
      $list.html(`
        <div class="text-center text-muted">
          <p>No models match your filter.</p>
          <button class="btn btn-outline-secondary mt-3" id="suggestModelBtn">Suggest a Model</button>
        </div>
      `);

      $('#loadMoreBtn').addClass('d-none');

      $('#suggestModelBtn').off('click').on('click', function () {
        alert("Thank you for your interest! We'll soon let you suggest a model.");
      });
      return;
    }

    models.forEach((model, index) => {
      const globalIndex = (currentPage - 1) * modelsPerPage + index;
      const featuresHTML = model.features.map(f => `<li>✅ ${f}</li>`).join("");
      $list.append(`
        <div class="col-md-6 col-lg-4 mb-4 d-flex" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="card h-100 shadow-sm rounded-4 flex-fill">
            <img src="uploads/ev_models/${model.imageUrl}" class="card-img-top rounded-top-4" alt="${model.name}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-success">${model.name}</h5>
              <h6 class="card-subtitle mb-2 text-muted">₹${model.price}</h6>
              <ul class="list-unstyled small mb-3">${featuresHTML}</ul>
              <button class="btn btn-outline-primary mt-auto view-details-btn" data-index="${globalIndex}">View Details</button>
            </div>
          </div>
        </div>
      `);
    });

    $('.view-details-btn').off('click').on('click', function () {
      const index = $(this).data('index');
      const model = filteredModels[index];
      showDetailsModal(model);
    });
  }

  function applyFilters() {
  const range = $('#rangeFilter').val();
  const sort = $('#sortPrice').val();
  const search = $('#searchInput').val().toLowerCase().trim();
  let filtered = [...allModels];

  if (range) {
    filtered = filtered.filter(model => {
      const kmFeature = model.features.find(f => f.toLowerCase().includes("km"));
      const km = kmFeature ? parseInt(kmFeature.replace(/[^\d]/g, "")) : 0;
      if (range === "below100") return km < 100;
      if (range === "100to150") return km >= 100 && km <= 150;
      if (range === "above150") return km > 150;
    });
  }

  if (search) {
    filtered = filtered.filter(model =>
      model.name.toLowerCase().includes(search) ||
      model.features.some(f => f.toLowerCase().includes(search))
    );
  }

  if (sort === "asc") {
    filtered.sort((a, b) => parseInt(a.price.replace(/[^\d]/g, "")) - parseInt(b.price.replace(/[^\d]/g, "")));
  } else if (sort === "desc") {
    filtered.sort((a, b) => parseInt(b.price.replace(/[^\d]/g, "")) - parseInt(a.price.replace(/[^\d]/g, "")));
  }

  updateActiveFilters(range, sort, search);

  currentPage = 1;
  renderModels(getPageModels(filtered, currentPage));
  updatePagination(filtered.length);
}


  function getPageModels(models, page) {
    const start = (page - 1) * modelsPerPage;
    return models.slice(start, start + modelsPerPage);
  }

  function toggleLoadMoreButton() {
    const shownCount = currentPage * modelsPerPage;
    const $btn = $('#loadMoreBtn');
    if (shownCount >= filteredModels.length) {
      $btn.addClass('d-none');
    } else {
      $btn.removeClass('d-none');
    }
  }

  function showDetailsModal(model) {
    $('#modalImage').attr('src', `uploads/ev_models/${model.imageUrl}`);
    $('#modalName').text(model.name);
    $('#modalPrice').text(`₹${model.price}`);
    $('#modalFeatures').html(model.features.map(f => `<li>✅ ${f}</li>`).join(""));

    const modal = new bootstrap.Modal(document.getElementById('evDetailsModal'));
    modal.show();
  }

 function updateActiveFilters(range, sort, search) {
  const $chipContainer = $('#filter-chips');
  $chipContainer.empty();
  let hasFilter = false;

  if (range) {
    hasFilter = true;
    let label = '';
    if (range === 'below100') label = 'Below 100km';
    else if (range === '100to150') label = '100–150km';
    else if (range === 'above150') label = 'Above 150km';

    $chipContainer.append(`
      <span class="badge bg-success me-2 filter-chip" data-type="range">
        Range: ${label} ✕
      </span>
    `);
  }

  if (sort) {
    hasFilter = true;
    const sortLabel = sort === 'asc' ? 'Price: Low to High' : 'Price: High to Low';
    $chipContainer.append(`
      <span class="badge bg-primary me-2 filter-chip" data-type="sort">
        ${sortLabel} ✕
      </span>
    `);
  }

  if (search) {
    hasFilter = true;
    $chipContainer.append(`
      <span class="badge bg-dark me-2 filter-chip" data-type="search">
        Search: "${search}" ✕
      </span>
    `);
  }

  $('#active-filters').toggle(hasFilter);

  // Remove chip behavior
  $('.filter-chip').off('click').on('click', function () {
    const type = $(this).data('type');
    if (type === 'range') $('#rangeFilter').val('');
    if (type === 'sort') $('#sortPrice').val('');
    if (type === 'search') $('#searchInput').val('');
    applyFilters();
  });
}

}
