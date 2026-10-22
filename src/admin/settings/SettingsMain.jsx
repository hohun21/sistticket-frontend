import React from "react";
import { Routes, Route } from 'react-router-dom';
import { Link } from "react-router-dom";
import "./SettingsMain.css";

export default function SettingsMain() {
    return (
        <div className="settings-main-wrapper container-fluid">
            <div className="container text-center" style={{ maxWidth: "1000px" }}>
                
                {/* 상단 타이틀 영역 */}
                <div className="mb-4">
                    <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-1px", fontSize: "1.75rem" }}>⚙️ SistTicket 관리자 패널</h2>
                    <p className="text-muted" style={{ fontSize: "0.95rem" }}>원하시는 관리 항목을 선택하여 세부 설정을 진행해주세요.</p>
                </div>

                {/* 가로 한 줄 정렬 컨테이너 */}
                <div className="settings-card-row">
                    
                    {/* 1. 콘서트 관리 */}
                    <div className="settings-card-col">
                        <div className="card dashboard-card">
                            <div className="card-body">
                                <div>
                                    <div className="icon-circle-box primary-bg mx-auto">
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                            <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                                            <line x1="12" x2="12" y1="19" y2="22"></line>
                                        </svg>
                                    </div>
                                    <h4 className="card-title">콘서트 관리</h4>
                                    <p className="card-text">공연 등록 및 캐스팅, 일정 조율 정보를 체계적으로 관리합니다.</p>
                                </div>
                                <Link 
                                    to="http://localhost/settings/concert" 
                                    className="btn btn-outline-primary w-100 rounded-pill mt-auto"
                                >
                                    이동하기 
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 2. 배우 관리 */}
                    <div className="settings-card-col">
                        <div className="card dashboard-card">
                            <div className="card-body">
                                <div>
                                    <div className="icon-circle-box success-bg mx-auto">
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 10s3-3 3-8c0 0 4 2 7 2s7-2 7-2c0 5 3 8 3 8"></path>
                                            <path d="M2 14c0 5 4 8 10 8s10-3 10-8"></path>
                                            <circle cx="9" cy="12" r="1"></circle>
                                            <circle cx="15" cy="12" r="1"></circle>
                                        </svg>
                                    </div>
                                    <h4 className="card-title">배우 관리</h4>
                                    <p className="card-text">출연진 정보 및 프로필 등록을 관리합니다.</p>
                                </div>
                                <Link 
                                    to="http://localhost/settings/actor" 
                                    className="btn btn-outline-success w-100 rounded-pill mt-auto"
                                >
                                    이동하기 
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 3. 장소 관리 */}
                    <div className="settings-card-col">
                        <div className="card dashboard-card">
                            <div className="card-body">
                                <div>
                                    <div className="icon-circle-box warning-bg mx-auto">
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                                            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                                            <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"></path>
                                            <line x1="10" y1="6" x2="14" y2="6"></line>
                                            <line x1="10" y1="10" x2="14" y2="10"></line>
                                            <line x1="10" y1="14" x2="14" y2="14"></line>
                                            <line x1="10" y1="18" x2="14" y2="18"></line>
                                        </svg>
                                    </div>
                                    <h4 className="card-title">장소 관리</h4>
                                    <p className="card-text">공연장 위치, 좌석 배치 및 수용 인원 정보를 관리합니다.</p>
                                </div>
                                <Link 
                                    to="http://localhost/settings/venue" 
                                    className="btn btn-outline-warning w-100 rounded-pill mt-auto text-dark"
                                >
                                    이동하기 
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}