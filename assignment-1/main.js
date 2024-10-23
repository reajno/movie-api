const renderSearchResults = (data) => {
  mainContainer.classList.add("d-none");

  // get list of movies from API call
  const movies = data.Search;

  // map each movie result as table row elements
  const searchResults = movies.map((movie) => {
    const { Title, Year, imdbID } = movie;

    return `<tr class="movie" data-imdbID="${imdbID}" style="cursor:pointer">
              <td class="movie-title">${Title}</td>
              <td class="movie-year">${Year}</td>
              </tr>`;
  });
  const searchResultsHTML = searchResults.join("");

  // define table element inside main container
  mainContainer.innerHTML = `
    <table id="table" class="table table-hover table-dark w-75">
     <thead>
      <tr>
         <th>Title</th>
         <th>Year</th>
      </tr>
     </thead>
     ${searchResultsHTML}
    </table>`;

  // show main container conditionally
  mainContainer.classList.remove("d-none");
  // mainContainer.classList.contains("d-none")
  //   ? mainContainer.classList.remove("d-none")
  //   : null;

  // clear input value
  movieInput.value = "";

  // add click event listener to each movie table row
  const results = document.querySelectorAll("tr.movie");

  if (results.length > 0) {
    results.forEach((movie) => {
      movie.addEventListener("click", getMovieDetails);
    });
  }
};

const renderMovieDetails = (detailsObj) => {
  // destructure response object for ease of use
  const { Title, Year, Rated, Genre, Director, Actors, Awards, Plot, Ratings } =
    detailsObj;

  // reset table element inside main container
  mainContainer.innerHTML = `
         <table id="table" class="table table-hover table-dark w-75">
         <tbody>
        <tr>
          <th>Title</th>
          <td class="movie-title">${Title}</td>
        </tr>
        <tr>
          <th>Year</th>
          <td class="movie-year">${Year}</td>
        </tr>
        <tr>
          <th>Rated</th>
          <td class="movie-rated">${Rated}</td>
        </tr>
        <tr>
          <th>Genre</th>
          <td class="movie-genre">${Genre}</td>
        </tr>
        <tr>
          <th>Director</th>
          <td class="movie-director">${Director}</td>
        </tr>
        <tr>
          <th>Actors</th>
          <td class="movie-actors">${Actors}</td>
        </tr>
        <tr>
          <th>Awards</th>
          <td class="movie-actors">${Awards}</td>
        </tr>
        <tr>
          <th>Plot</th>
          <td class="movie-plot">${Plot}</td>
        </tr>
      </tbody>
         </table>`;

  const ratings = Ratings.map((rating) => {
    return `
    <h6>${rating.Source}: ${rating.Value}</h6>
    `;
  });

  ratingsHTML = ratings.join("");

  const movieRatingsHTML = `<div class="card">
        <div class="card-body d-flex flex-column gap-2">
          <h5 class="card-title text-center fw-bold">Ratings</h5>
          <div
            id="ratings"
            class="d-flex flex-wrap justify-content-center gap-4"
          >
          ${ratingsHTML}
          </div>
        </div>
      </div>`;

  // add as sibling node after table element
  table.insertAdjacentHTML("afterend", movieRatingsHTML);
};

const renderStreamingDetails = (streamingInfoObj) => {
  const table = document.getElementById("table");

  const streams = streamingInfoObj.map((streamer) => {
    if (streamer.type !== "addon") {
      return `
            <div class="service d-flex flex-column align-items-center">
              <a href="${streamer.link}">
                <img
                style="max-height: 2rem"
                src="${streamer.service.imageSet.lightThemeImage}"
                alt="${streamer.service.name} Logo"
                />
                </a>
                <h6 style="font-size: 0.8rem">${streamer.type}</h6>
                </div>`;
    }
  });

  const streamsHTML = streams.join("");

  // define parent streams element
  const streamsParentHTML = `<div class="card">
            <div class="card-body d-flex flex-column gap-2">
              <h5 class="card-title text-center fw-bold">Now Streaming</h5>
              <div id="streamers" class="d-flex flex-wrap justify-content-center gap-4">
              ${streamsHTML}
              </div>
            </div>
          </div>`;

  // add as sibling node after table element
  table.insertAdjacentHTML("afterend", streamsParentHTML);
};

const renderPosterElements = (imdbID) => {
  // define poster elements
  const posterBtnGroupHTML = `
         <div class="container text-center">
           <form id="posterUploadForm">
             <input
             id="posterUpload"
             type="file"
             name="poster"
             accept=".png"
             />
             <button type="submit" class="btn btn-warning">
               Upload Poster
               </button>
               </form>
               <button
                 id="posterDisplayBtn"
                 class="mt-4 btn btn-success w-100">Show Poster
               </button>
               <img id="moviePoster" class="d-none" src="" alt="Movie Poster">
               </div>
         `;

  // add as last child of main container
  mainContainer.insertAdjacentHTML("beforeend", posterBtnGroupHTML);

  // add event listeners to buttons
  const posterUploadForm = document.getElementById("posterUploadForm");
  posterUploadForm.addEventListener("submit", (e) => addPoster(e, imdbID));

  const posterDisplayBtn = document.getElementById("posterDisplayBtn");
  posterDisplayBtn.addEventListener("click", (e) => getPoster(e, imdbID));
};

const getSearchResults = async (e) => {
  e.preventDefault();
  if (isLoading) return;
  isLoading = true;
  handleLoadingState(isLoading);
  try {
    let res = await fetch(
      // Send fetch request to API URL
      // with input value as search params in the URL.
      `http://localhost:3000/movies/search/${movieInput.value}`
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }
    const data = await res.json();
    renderSearchResults(data);
  } catch (error) {
    alert(error.message);
  } finally {
    isLoading = false;
    handleLoadingState(isLoading);
  }
};

const getMovieDetails = async (e) => {
  if (isLoading) return;
  isLoading = true;
  handleLoadingState(isLoading);
  const imdbID = e.target.parentNode.dataset.imdbid;
  try {
    let res = await fetch(`http://localhost:3000/movies/data/${imdbID}`);
    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    const data = await res.json();
    renderMovieDetails(data.details);
    renderStreamingDetails(data.streamingInfo);
    renderPosterElements(data.details.imdbID);
  } catch (error) {
    alert(error.message);
  } finally {
    isLoading = false;
    handleLoadingState(isLoading);
  }
};

const getPoster = async (e, imdbID) => {
  e.preventDefault();

  const moviePoster = document.getElementById("moviePoster");
  if (moviePoster.getAttribute("src") !== "") {
    moviePoster.classList.toggle("d-none");
  } else {
    try {
      let res = await fetch(`http://localhost:3000/posters/${imdbID}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }
      const imgSrc = res.url;
      moviePoster.src = imgSrc;
      moviePoster.classList.toggle("d-none");
    } catch (error) {
      alert(error.message);
    }
  }
};

const addPoster = async (e, imdbID) => {
  e.preventDefault();

  const fileInput = document.getElementById("posterUpload");
  const image = fileInput.files[0];

  if (!image) {
    alert("Please select a file to upload");
  } else {
    try {
      let res = await fetch(`http://localhost:3000/posters/add/${imdbID}`, {
        method: "POST",
        body: image,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  }
};

const handleLoadingState = (isLoading) => {
  const searchBtn = document.getElementById("movieSearchBtn");
  const loadingIndicator = document.getElementById("loadingIndicator");

  if (isLoading) {
    searchBtn.toggleAttribute("disabled");
    mainContainer.classList.add("d-none");
    loadingIndicator.classList.remove("d-none");
  } else {
    searchBtn.toggleAttribute("disabled");
    mainContainer.classList.remove("d-none");
    loadingIndicator.classList.add("d-none");
  }
};

let isLoading = false;

const mainContainer = document.querySelector("main.container");
const movieInput = document.getElementById("movieSearch");
const movieSearchForm = document.getElementById("movieSearchForm");
movieSearchForm.addEventListener("submit", getSearchResults);
