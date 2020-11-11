// Code generated by MockGen. DO NOT EDIT.
// Source: repository/interfaces/auth.go

// Package mock_interfaces is a generated GoMock package.
package mock_interfaces

import (
	interfaces "github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/interfaces"
	gomock "github.com/golang/mock/gomock"
	echo "github.com/labstack/echo/v4"
	reflect "reflect"
)

// MockStratosAuth is a mock of StratosAuth interface
type MockStratosAuth struct {
	ctrl     *gomock.Controller
	recorder *MockStratosAuthMockRecorder
}

// MockStratosAuthMockRecorder is the mock recorder for MockStratosAuth
type MockStratosAuthMockRecorder struct {
	mock *MockStratosAuth
}

// NewMockStratosAuth creates a new mock instance
func NewMockStratosAuth(ctrl *gomock.Controller) *MockStratosAuth {
	mock := &MockStratosAuth{ctrl: ctrl}
	mock.recorder = &MockStratosAuthMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockStratosAuth) EXPECT() *MockStratosAuthMockRecorder {
	return m.recorder
}

// Login mocks base method
func (m *MockStratosAuth) Login(c echo.Context) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Login", c)
	ret0, _ := ret[0].(error)
	return ret0
}

// Login indicates an expected call of Login
func (mr *MockStratosAuthMockRecorder) Login(c interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Login", reflect.TypeOf((*MockStratosAuth)(nil).Login), c)
}

// Logout mocks base method
func (m *MockStratosAuth) Logout(c echo.Context) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Logout", c)
	ret0, _ := ret[0].(error)
	return ret0
}

// Logout indicates an expected call of Logout
func (mr *MockStratosAuthMockRecorder) Logout(c interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Logout", reflect.TypeOf((*MockStratosAuth)(nil).Logout), c)
}

// GetUsername mocks base method
func (m *MockStratosAuth) GetUsername(userGUID string) (string, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetUsername", userGUID)
	ret0, _ := ret[0].(string)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetUsername indicates an expected call of GetUsername
func (mr *MockStratosAuthMockRecorder) GetUsername(userGUID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetUsername", reflect.TypeOf((*MockStratosAuth)(nil).GetUsername), userGUID)
}

// GetUser mocks base method
func (m *MockStratosAuth) GetUser(userGUID string) (*interfaces.ConnectedUser, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetUser", userGUID)
	ret0, _ := ret[0].(*interfaces.ConnectedUser)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetUser indicates an expected call of GetUser
func (mr *MockStratosAuthMockRecorder) GetUser(userGUID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetUser", reflect.TypeOf((*MockStratosAuth)(nil).GetUser), userGUID)
}

// VerifySession mocks base method
func (m *MockStratosAuth) VerifySession(c echo.Context, sessionUser string, sessionExpireTime int64) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "VerifySession", c, sessionUser, sessionExpireTime)
	ret0, _ := ret[0].(error)
	return ret0
}

// VerifySession indicates an expected call of VerifySession
func (mr *MockStratosAuthMockRecorder) VerifySession(c, sessionUser, sessionExpireTime interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "VerifySession", reflect.TypeOf((*MockStratosAuth)(nil).VerifySession), c, sessionUser, sessionExpireTime)
}
