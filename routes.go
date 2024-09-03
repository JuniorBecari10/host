package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func getLogin(c *gin.Context) {
	c.File("views/login.html")
}

func postLogin(c *gin.Context) {

}

// ---

func requireAuth(c *gin.Context) {
	var user User

	if err := c.ShouldBind(&user); err != nil {
		c.Status(http.StatusBadRequest)
  	return
	}

	if !isAuthorized(&user) {
		c.AbortWithStatus(http.StatusUnauthorized)
	}
}
