package com.project.task_portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(
		scanBasePackages = "com.project.task_portal",
		exclude = { UserDetailsServiceAutoConfiguration.class }
)
public class TaskPortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskPortalApplication.class, args);
	}
}