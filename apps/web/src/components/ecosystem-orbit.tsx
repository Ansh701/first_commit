import { Building2, HandHeart, Landmark, ShieldCheck, UsersRound } from "lucide-react";

const nodes = [
  { label: "Organizations", icon: Building2, position: "orbit-node-a" },
  { label: "Donors", icon: HandHeart, position: "orbit-node-b" },
  { label: "CSR teams", icon: Landmark, position: "orbit-node-c" },
  { label: "Volunteers", icon: UsersRound, position: "orbit-node-d" },
  { label: "Reviewers", icon: ShieldCheck, position: "orbit-node-e" },
];

export function EcosystemOrbit() {
  return (
    <section className="marketing-section ecosystem-section" aria-labelledby="ecosystem-title">
      <div className="section-heading-split"><div><p className="marketing-kicker">One public ecosystem</p><h2 id="ecosystem-title">Different roles. One accountable trail.</h2></div><p>INSIPS keeps public discovery, contribution, preparation, and review connected without flattening every person into the same dashboard.</p></div>
      <div className="ecosystem-orbit" aria-label="Organizations, donors, CSR teams, volunteers, and reviewers connected through INSIPS">
        <div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" />
        <div className="orbit-center"><strong>INSIPS</strong><span>evidence to public clarity</span></div>
        {nodes.map(({ label, icon: Icon, position }) => <div className={`orbit-node ${position}`} key={label}><Icon size={18} /><span>{label}</span></div>)}
      </div>
    </section>
  );
}
