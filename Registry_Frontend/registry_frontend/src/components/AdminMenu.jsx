import React from "react";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Row, Col } from "react-bootstrap";
import { FaUsers, FaFileAlt, FaCog, FaArrowRight, FaChartBar } from "react-icons/fa";

const menu = [
	{
		title: "Manage Users",
		icon: <FaUsers size={40} />,
		description: "View, add, or edit super users and citizens.",
		value: "Manage Users",
		gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
		iconBg: "linear-gradient(135deg, #1e40af, #3b82f6)",
		buttonColor: "#1e40af",
		accent: "#0f172a"
	},
	{
		title: "Review Applications",
		icon: <FaFileAlt size={40} />,
		description: "Review, approve, or reject document applications.",
		value: "Review Applications",
		gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
		iconBg: "linear-gradient(135deg, #059669, #10b981)",
		buttonColor: "#059669",
		accent: "#0f172a"
	},
	{
		title: "Application Statistics",
		icon: <FaChartBar size={40} />,
		description: "View comprehensive statistics and analytics for all applications.",
		value: "Application Statistics",
		gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
		iconBg: "linear-gradient(135deg, #dc2626, #ef4444)",
		buttonColor: "#dc2626",
		accent: "#0f172a"
	},
	{
		title: "Settings",
		icon: <FaCog size={40} />,
		description: "Configure registry branches and system settings.",
		value: "Settings",
		gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
		iconBg: "linear-gradient(135deg, #7c3aed, #a855f7)",
		buttonColor: "#7c3aed",
		accent: "#0f172a"
	},
];

function AdminMenu({ onSelect }) {
		const { user } = useAuth();
		return (
			<div className="container-fluid py-5 px-2 px-md-4 admin-dashboard-container" style={{
				background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
				minHeight: '100vh',
				position: 'relative',
				overflow: 'hidden'
			}}>
				{/* Decorative background elements */}
				<div className="position-absolute top-0 start-0" style={{
					width: '200px',
					height: '200px',
					background: 'linear-gradient(45deg, rgba(30, 64, 175, 0.06), rgba(59, 130, 246, 0.04))',
					borderRadius: '50%',
					transform: 'translate(-50px, -50px)',
					animation: 'float 8s ease-in-out infinite'
				}}></div>
				<div className="position-absolute top-0 end-0" style={{
					width: '150px',
					height: '150px',
					background: 'linear-gradient(45deg, rgba(5, 150, 105, 0.06), rgba(16, 185, 129, 0.04))',
					borderRadius: '50%',
					transform: 'translate(50px, -30px)',
					animation: 'float 8s ease-in-out infinite 2.5s'
				}}></div>
				<div className="position-absolute bottom-0 start-50" style={{
					width: '180px',
					height: '180px',
					background: 'linear-gradient(45deg, rgba(124, 58, 237, 0.06), rgba(168, 85, 247, 0.04))',
					borderRadius: '50%',
					transform: 'translate(-50%, 50px)',
					animation: 'float 8s ease-in-out infinite 5s'
				}}></div>

				<div className="position-relative" style={{ zIndex: 2 }}>
					<div className="text-center mb-5">
						<h1 className="fw-bold mb-3 admin-dashboard-title" style={{
							background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							fontSize: '2.5rem',
							textShadow: '0 4px 8px rgba(0,0,0,0.1)',
							animation: 'slideInDown 1s cubic-bezier(0.4, 0, 0.2, 1)',
							color: '#0f172a',
							letterSpacing: '-0.02em'
						}}>
							⚡ Admin Dashboard
						</h1>
						{user && (
							<h3 className="fw-bold admin-welcome-text" style={{
								background: 'linear-gradient(45deg, #059669, #10b981)',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								fontSize: '1.3rem',
								textShadow: '0 2px 4px rgba(0,0,0,0.1)',
								animation: 'slideInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both',
								color: '#0f172a',
								letterSpacing: '-0.01em'
							}}>
								👋 Welcome, {user.full_name || user.name || user.email.split('@')[0]}!
							</h3>
						)}
					</div>

					<Row xs={1} sm={2} md={2} lg={2} xl={2} className="g-4 g-lg-5 justify-content-center">
					{menu.map((item, idx) => (
							<Col key={idx} className="d-flex">
								<Card 
									className="h-100 text-center border-0 position-relative overflow-hidden admin-menu-card" 
									style={{
										background: 'rgba(255, 255, 255, 0.8)',
										backdropFilter: 'blur(20px)',
										borderRadius: '20px',
										boxShadow: '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
										transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
										animation: `slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.15}s both`,
										border: '1px solid rgba(15, 23, 42, 0.06)'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
										e.currentTarget.style.boxShadow = '0 35px 70px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = 'translateY(0) scale(1)';
										e.currentTarget.style.boxShadow = '0 25px 50px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)';
									}}
								>
									{/* Card gradient overlay */}
									<div 
										className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
										style={{ background: item.gradient }}
									></div>
									
									<Card.Body className="position-relative d-flex flex-column justify-content-between p-4 p-lg-5">
										<div>
											<div 
												className="d-flex align-items-center justify-content-center mb-4" 
												style={{
													width: '80px',
													height: '80px',
													background: item.iconBg,
													borderRadius: '24px',
													margin: '0 auto',
													boxShadow: '0 12px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
													animation: 'pulse 3s ease-in-out infinite',
													transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
													e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
													e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)';
												}}
											>
												<div className="text-white" style={{ transition: 'all 0.3s ease', fontSize: '2rem' }}>
													{item.icon}
												</div>
											</div>
											
											<Card.Title 
												className="fw-bold mb-3 admin-menu-card-title" 
												style={{
													fontSize: '1.4rem',
													color: '#1e293b',
													textShadow: '0 2px 4px rgba(0,0,0,0.1)',
													fontWeight: '700'
												}}
											>
												{item.title}
											</Card.Title>
											
											<Card.Text 
												className="mb-4 admin-menu-card-text" 
												style={{
													fontSize: '1rem',
													lineHeight: '1.6',
													fontWeight: '500',
													color: '#475569'
												}}
											>
												{item.description}
											</Card.Text>
										</div>
										
										<Button 
											variant="outline-primary" 
											className="fw-bold border-0 position-relative overflow-hidden admin-menu-button" 
											onClick={() => onSelect(item.value)}
											style={{
												background: item.iconBg,
												color: 'white',
												borderRadius: '16px',
												padding: '14px 28px',
												fontSize: '1.1rem',
												boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
												transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
												textShadow: '0 1px 2px rgba(0,0,0,0.1)',
												fontWeight: '600',
												letterSpacing: '0.025em'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
												e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0) scale(1)';
												e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
											}}
										>
											<span className="d-flex align-items-center justify-content-center gap-2">
												Go <FaArrowRight size={16} style={{ transition: 'transform 0.3s ease' }} />
											</span>
										</Button>
								</Card.Body>
							</Card>
						</Col>
					))}
				</Row>
				</div>
			</div>
		);
}

export default AdminMenu;
