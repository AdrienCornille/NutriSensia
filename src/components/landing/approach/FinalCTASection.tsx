"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Section CTA Finale - Page L'Approche
 *
 * Cette section conclut la page avec un appel à l'action centré et convaincant.
 *
 * Features:
 * - Container centré max-width 700px
 * - Titre H2 impactant
 * - 3 paragraphes de support
 * - CTA primaire (gros bouton)
 * - CTA secondaire (lien discret)
 * - Texte de réassurance
 * - Background accent léger
 * - Animations au scroll
 *
 * @example
 * ```tsx
 * <FinalCTASection />
 * ```
 */
export function FinalCTASection() {
  return (
    <section
      className={cn(
        "relative w-full bg-accent-teal/5 py-64dp",
        "overflow-hidden"
      )}
    >
      <div className="container mx-auto px-16dp sm:px-24dp lg:px-32dp">
        {/* Container centré */}
        <motion.div
          className="mx-auto max-w-[700px] text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {/* Titre H2 */}
          <h2 className="mb-32dp font-sans text-h2 text-primary-dark sm:text-4xl sm:leading-[1.2]">
            Prête à Commencer ?
          </h2>

          {/* Paragraphes de support */}
          <div className="mb-48dp space-y-24dp">
            <motion.p
              className="font-sans text-body-large leading-relaxed text-neutral-dark"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              Si vous êtes arrivée jusqu&apos;ici, c&apos;est que quelque chose
              résonne.
            </motion.p>

            <motion.p
              className="font-sans text-body-large leading-relaxed text-neutral-dark"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              Mon approche n&apos;est pas magique. Elle demande de
              l&apos;investissement, de l&apos;ouverture et du temps. Mais elle
              fonctionne. Parce qu&apos;elle respecte votre corps, votre vie et
              votre rythme.
            </motion.p>

            <motion.p
              className="font-sans text-body-large leading-relaxed text-neutral-dark"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              La première étape, c&apos;est de faire connaissance. 1h30 pour
              parler de vous, de votre situation, de vos objectifs. Sans
              engagement, sans pression. Juste pour voir si on peut travailler
              ensemble.
            </motion.p>
          </div>

          {/* CTAs */}
          <motion.div
            className="space-y-16dp"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          >
            {/* CTA Primaire */}
            <div>
              <motion.button
                className={cn(
                  "inline-flex items-center justify-center gap-12dp",
                  "rounded-12dp bg-accent-teal px-32dp py-16dp",
                  "font-sans text-lg font-semibold text-white",
                  "shadow-[0_4px_20px_rgba(0,166,147,0.25)]",
                  "transition-all duration-standard",
                  "hover:bg-accent-teal/90 hover:shadow-[0_6px_25px_rgba(0,166,147,0.35)]",
                  "focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2"
                )}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Redirection vers la page de réservation
                  window.location.href = "/contact";
                }}
              >
                <span>Réserver Ma Consultation Découverte</span>
              </motion.button>
            </div>

            {/* CTA Secondaire */}
            <div>
              <motion.a
                href="/contact"
                className={cn(
                  "inline-flex items-center gap-8dp",
                  "font-sans text-body text-primary",
                  "transition-colors duration-standard",
                  "hover:text-accent-teal"
                )}
                whileHover={{ x: 4 }}
              >
                <span>Vous avez des questions ?</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold">Écrivez-moi</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Texte de réassurance */}
          <motion.p
            className="mt-32dp font-sans text-body-small text-neutral-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: 0.5,
              ease: [0.4, 0.0, 0.2, 1],
            }}
          >
            En ligne • Remboursable par votre assurance • Premier pas vers une
            vraie transformation
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTASection;
