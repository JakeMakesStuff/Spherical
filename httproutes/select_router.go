package httproutes

import (
	"net/http"

	"github.com/jakemakesstuff/spherical/config"
	"github.com/jakemakesstuff/spherical/httproutes/application"
	"github.com/jakemakesstuff/spherical/httproutes/oobe"
)

// SelectRouter is a function used to select the router based on the state of the config.
func SelectRouter() http.Handler {
	appRouter := application.Router()
	oobeRouter := oobe.Router()
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if config.Config().Setup {
			// Use the main router.
			appRouter.ServeHTTP(writer, request)
		} else {
			// Use the OOBE router.
			oobeRouter.ServeHTTP(writer, request)
		}
	})
}
