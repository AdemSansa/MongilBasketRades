package com.mongilbasket;

import java.util.Locale;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		// Force English regardless of server locale — Bean Validation's
		// message interpolator falls back to the JVM default locale, and
		// the API must return locale-independent messages (the Flutter
		// client owns its own localization).
		Locale.setDefault(Locale.ENGLISH);
		SpringApplication.run(BackendApplication.class, args);
	}

}
