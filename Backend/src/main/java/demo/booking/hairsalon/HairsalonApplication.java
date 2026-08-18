package demo.booking.hairsalon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HairsalonApplication {

	public static void main(String[] args) {
		SpringApplication.run(HairsalonApplication.class, args);
	}

}
