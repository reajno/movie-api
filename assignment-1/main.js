
      const renderSearchResults = (data) => {
        // define table element inside main container
        mainContainer.innerHTML = `
         <table id="table" class="table table-hover table-dark w-75">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              </tr>
              </thead>
              </table>`;

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

        // add generated table row elements to table, after table header
        const tableHeader = document.querySelector("thead");
        tableHeader.insertAdjacentHTML("afterend", searchResultsHTML);

        // show main container conditionally
        mainContainer.classList.contains("d-none")
          ? mainContainer.classList.remove("d-none")
          : null;
        
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
        const {
          Title,
          Year,
          Rated,
          Genre,
          Director,
          Actors,
          Awards,
          Plot,
          imdbID,
          Ratings,
        } = detailsObj;

        // reset table element inside main container
        mainContainer.innerHTML = `
         <table id="table" class="table table-hover table-dark w-75"></table>`;

        // define table body element with movie details
        const movieDetailsHTML = `<tbody>
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
      </tbody>`;

        // add table body into table element
        const table = document.getElementById("table");
        table.innerHTML = movieDetailsHTML;

        // define movie ratings element
        const movieRatingsHTML = `<div class="d-flex flex-column w-100">
          <h1 class="fs-3 fw-bold text-center mb-2">Ratings</h1>
          <div class="d-flex justify-content-evenly">
            <h5>IMDB: ${Ratings[0].Value}</h5>
            <h5>RT: ${Ratings[1].Value}</h5>
            <h5>Metacritic: ${Ratings[2].Value}</h5>
          </div>
        </div>`;

        // add as sibling node after table element
        table.insertAdjacentHTML("afterend", movieRatingsHTML);

        // define poster elements
        // const posterBtnGroupHTML = `
        // <div class="container">
        //   <form id="posterUploadForm">
        //     <input
        //     type="file"
        //     name="poster"
        //     id="posterUpload"
        //     />
        //     <button type="submit" class="btn btn-warning">
        //       Upload Poster
        //       </button>
        //       </form>
        //       <button
        //         id="posterDisplayBtn"
        //         class="mt-4 btn btn-success w-100">Show Poster
        //       </button>
        //       <img id="moviePoster" class="d-none" src="" alt="Movie Poster">
        //       </div>
        // `;

        // // add as sibling node after main container
        // mainContainer.insertAdjacentHTML("afterend", posterBtnGroupHTML);

        // // add event listeners to buttons
        // const posterUploadForm = document.getElementById("posterUploadForm");
        // posterUploadForm.addEventListener("submit", (e) =>
        //   addPoster(e, imdbID)
        // );

        // const posterDisplayBtn = document.getElementById("posterDisplayBtn");
        // posterDisplayBtn.addEventListener("click", (e) => getPoster(e, imdbID));
      };

      const renderStreamingDetails = (streamingInfoObj) => {
        const table = document.getElementById("table");

        // define parent streams element
        const streamsParentHTML = `<div class="card">
            <div class="card-body d-flex flex-column gap-2">
              <h5 class="card-title text-center fw-bold">Now Streaming</h5>
              <div id="streamers" class="d-flex flex-wrap justify-content-center gap-4">
              </div>
            </div>
          </div>;`;

        // add as sibling node after table element
        table.insertAdjacentHTML("afterend", streamsParentHTML);
        const streamContainer = document.getElementById('streamers')
        
        const streams = streamingInfoObj.map((streamer) => {
          if (streamer.type !== 'addon'){
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
        streamContainer.innerHTML = streamsHTML;
      };

      const renderPosterElements = (imdbID) => {
         // define poster elements
         const posterBtnGroupHTML = `
         <div class="container">
           <form id="posterUploadForm">
             <input
             type="file"
             name="poster"
             id="posterUpload"
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
 
         // add as sibling node after main container
         mainContainer.insertAdjacentHTML("afterend", posterBtnGroupHTML);
 
         // add event listeners to buttons
         const posterUploadForm = document.getElementById("posterUploadForm");
         posterUploadForm.addEventListener("submit", (e) =>
           addPoster(e, imdbID)
         );
 
         const posterDisplayBtn = document.getElementById("posterDisplayBtn");
         posterDisplayBtn.addEventListener("click", (e) => getPoster(e, imdbID));
      }

      const showMoviePoster = (imgSrc) => {
        const moviePoster = document.getElementById("moviePoster");
        imgSrc ? moviePoster.classList.toggle("d-none") : null;

        moviePoster.src = imgSrc;
      };

      const getForm = async (e) => {
        e.preventDefault();
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
        }
      };

      const getMovieDetails = async (e) => {
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
          renderPosterElements(data.details.imdbID)
        } catch (error) {
          alert(error.message);
        }
      };

      const getPoster = async (e, imdbID) => {
        e.preventDefault();
        try {
          let res = await fetch(`http://localhost:3000/posters/${imdbID}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw errorData;
          }
          const imgSrc = await res.url;
          showMoviePoster(imgSrc);
        } catch (error) {
          alert(error.message);
        }
      };

      const addPoster = async (e, imdbID) => {
        e.preventDefault();

        const fileInput = document.getElementById("posterUpload");
        const image = fileInput.files[0];
        if (image) {
          try {
            let res = await fetch(
              `http://localhost:3000/posters/add/${imdbID}`,
              {
                method: "POST",
                body: image,
              }
            );

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

      const mainContainer = document.querySelector("main.container");
      const movieInput = document.getElementById("movieSearch");
      const movieSearchForm = document.getElementById("movieSearchForm");
      movieSearchForm.addEventListener("submit", getForm);