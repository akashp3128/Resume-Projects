package patel.akash.movies;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/*
Api layer. only concern with task of getting request from user and return response
using service class and delegating task of fetching all movies from database and giving it back to API layer.
Does not know what is going on in service class
 */
@RestController
@CrossOrigin(origins = "https://localhost:3000")
@RequestMapping("/api/v1/movies")
public class MovieController {
    @Autowired //instantiates MovieService class for us
    private MovieService movieService;
    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies(){
        return new ResponseEntity<List<Movie>>(movieService.allMovies(), HttpStatus.OK); //creating
    }

    @GetMapping("/{imdbId}")
    public ResponseEntity<Optional<Movie>> getSingleMovie(@PathVariable String imdbId){
        return new ResponseEntity<Optional<Movie>>(movieService.singleMovie(imdbId), HttpStatus.OK);
    }
}
