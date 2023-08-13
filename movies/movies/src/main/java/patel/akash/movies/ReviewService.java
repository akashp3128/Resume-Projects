package patel.akash.movies;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    //look for movie with given imdbId, then create new review and associate with found movie
    public Review createReview(String reviewBody, String imdbId) {
        Review review = new Review(reviewBody);
        reviewRepository.insert(review);

        //Using to update movie with new review being pushed using the repository
        mongoTemplate.update(Movie.class)
                .matching(Criteria.where("imdbId").is (imdbId)) //ImdbId from database matches with imdbId from user
                .apply(new Update().push("reviewIds").value(review)) //update and push review to review id array
                .first();

        return review;
    }

}
