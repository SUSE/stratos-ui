package main

import (
	"errors"
	"net/http"

	"github.com/hpcloud/portal-proxy/components/core/backend/repository/interfaces"
	"github.com/labstack/echo"
)

// Endpoint - This represents the CNSI endpoint
type Endpoint struct {
	GUID     string         `json:"guid"`
	Name     string         `json:"name"`
	Version  string         `json:"version"`
	User     *ConnectedUser `json:"user"`
	CNSIType string         `json:"type"`
}

// Info - this represents user specific info
type Info struct {
	Versions     *Versions                       `json:"version"`
	User         *ConnectedUser                  `json:"user"`
	Endpoints    map[string]map[string]*Endpoint `json:"endpoints"`
	CloudFoundry *interfaces.CFInfo              `json:"cloud-foundry,omitempty"`
}

func (p *portalProxy) info(c echo.Context) error {

	s, err := p.getInfo(c)
	if err != nil {
		return echo.NewHTTPError(http.StatusForbidden, err.Error())
	}

	return c.JSON(http.StatusOK, s)
}

func (p *portalProxy) getInfo(c echo.Context) (*Info, error) {
	// get the version
	versions, err := p.getVersionsData()
	if err != nil {
		return nil, errors.New("Could not find database version")
	}

	// get the user
	userGUID, err := p.getSessionStringValue(c, "user_id")
	if err != nil {
		return nil, errors.New("Could not find session user_id")
	}

	uaaUser, err := p.getUAAUser(userGUID)
	if err != nil {
		return nil, errors.New("Could not load session user data")
	}

	// create initial info struct
	s := &Info{
		Versions:     versions,
		User:         uaaUser,
		Endpoints:    make(map[string]map[string]*Endpoint),
		CloudFoundry: p.Config.CloudFoundryInfo,
	}
	// initialize the Endpoints maps
	for _, endpoint := range p.EndpointPlugins {
		s.Endpoints[endpoint.GetType()] = make(map[string]*Endpoint)
	}
	// get the CNSI Endpoints
	cnsiList, _ := p.buildCNSIList(c)
	for _, cnsi := range cnsiList {
		endpoint := &Endpoint{
			GUID: cnsi.GUID,
			Name: cnsi.Name,
		}
		// try to get the user info for this cnsi for the user
		cnsiUser, ok := p.getCNSIUser(cnsi.GUID, userGUID)
		if ok {
			endpoint.User = cnsiUser
		}
		cnsiType := cnsi.CNSIType
		s.Endpoints[cnsiType][cnsi.GUID] = endpoint
	}

	return s, nil
}
