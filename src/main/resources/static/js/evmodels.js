// Only run once
if (!window.evModelsLoaded) {
  window.evModelsLoaded = true;

  let allModels = [];
  let filteredModels = [];
  let currentPage = 1;
  const modelsPerPage = 6;

  window.loadEvModelsPage = function () {
    const $list = $('#ev-model-list');
    $("#loader").removeClass("d-none");

    $.get(`${BASE_URL}/getAllModels`, function (evModels) {
      $("#loader").addClass("d-none");
      allModels = evModels;
      filteredModels = [...allModels];
      renderModels(getPageModels(filteredModels, currentPage), true);
      toggleLoadMoreButton();
    }).fail(() => {
      $("#loader").addClass("d-none");
      $list.html(`<div class="text-center text-danger">Failed to load models.</div>`);
    });

    // Event bindings
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

  // Render model cards
  function renderModels(models, reset = false) {
    const $list = $('#ev-model-list');
    if (reset) $list.empty();

    if (currentPage === 1 && models.length === 0) {
      $list.html(`<div class="text-center text-muted"><p>No models found.</p></div>`);
      $('#loadMoreBtn').addClass('d-none');
      return;
    }

    models.forEach((model, index) => {
      const featuresHTML = (model.features || []).map(f => `<li>✅ ${f}</li>`).join("");
      const imgSrc = model.imagePath
        ? `${BASE_URL}/${model.imagePath}`
        : '/images/no-image.png';

      $list.append(`
        <div class="col-md-6 col-lg-4 mb-4 d-flex" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="card h-100 shadow-sm rounded-4 flex-fill">
            <img src="${imgSrc}" class="card-img-top rounded-top-4" alt="${model.modelName}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-success">${model.modelName}</h5>
              <h6 class="card-subtitle mb-2 text-muted">₹${model.price}</h6>
              <ul class="list-unstyled small mb-3">${featuresHTML}</ul>
              <button class="btn btn-outline-primary mt-auto view-details-btn" data-id="${model.id}">View Details</button>
            </div>
          </div>
        </div>
      `);
    });

    // Attach modal open events
    $('.view-details-btn').off('click').on('click', function () {
      const id = $(this).data('id');
      const model = allModels.find(m => m.id === id);
      if (model) showDetailsModal(model);
    });
  }

  // Filter and sort
  function applyFilters() {
    const range = $('#rangeFilter').val();
    const sort = $('#sortPrice').val();
    const search = $('#searchInput').val().toLowerCase().trim();
    let filtered = [...allModels];

    // ✅ FIX 1: use model.modelName (not model.name)
    if (search) {
      filtered = filtered.filter(model =>
        model.modelName.toLowerCase().includes(search) ||
        model.features.some(f => f.toLowerCase().includes(search))
      );
    }

    if (range) {
      filtered = filtered.filter(model => {
        const kmFeature = model.features.find(f => f.toLowerCase().includes("km"));
        const km = kmFeature ? parseInt(kmFeature.replace(/[^\d]/g, "")) : 0;
        if (range === "below100") return km < 100;
        if (range === "100to150") return km >= 100 && km <= 150;
        if (range === "above150") return km > 150;
        return true;
      });
    }

    // ✅ FIX 2: handle numeric price values safely
    if (sort === "asc") {
      filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
    } else if (sort === "desc") {
      filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
    }

    updateActiveFilters(range, sort, search);

    filteredModels = filtered;
    currentPage = 1;
    renderModels(getPageModels(filteredModels, currentPage), true);
    toggleLoadMoreButton();
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

  // ✅ FIX 3: consistent field names for modal
  function showDetailsModal(model) {
    const imgSrc = model.imagePath ? `${BASE_URL}/${model.imagePath}` : '/images/no-image.png';
    $('#modalImage').attr('src', imgSrc);
    $('#modalName').text(model.modelName);
    $('#modalPrice').text(`₹${model.price}`);
    $('#modalFeatures').html((model.features || []).map(f => `<li>✅ ${f}</li>`).join(""));
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

    $('.filter-chip').off('click').on('click', function () {
      const type = $(this).data('type');
      if (type === 'range') $('#rangeFilter').val('');
      if (type === 'sort') $('#sortPrice').val('');
      if (type === 'search') $('#searchInput').val('');
      applyFilters();
    });
  }
}
