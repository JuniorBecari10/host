package main

type User struct {
	Email    string `form:"email"`
	Password string `form:"password"`
}
